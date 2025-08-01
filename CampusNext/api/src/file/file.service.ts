import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { formatFileSize } from '../utils/file.utils';
import * as fs from 'fs-extra';
import * as path from 'path';

@Injectable()
export class FileService {
  private basePath: string;     // A fájlok gyökérkönyvtára, az .env-ből jön
  private configPath: string;   // A fájl-metaadatokat tartalmazó config.json elérési útja
  private meta: any;            // A config.json tartalma betöltve memóriába

  constructor(private configService: ConfigService) {
    this.basePath = this.configService.get<string>('BASE_PATH') ?? '';
    this.configPath = this.configService.get<string>('FILE_CONFIG_PATH') ?? '';

    // Ha létezik a config fájl, akkor beolvassuk az összes metaadatot,
    // ha nem, akkor létrehozunk egy új üres objektumot "Files" kulccsal
    this.meta = fs.pathExistsSync(this.configPath) ? fs.readJsonSync(this.configPath) : { 'Files': {} }
  }

  /**
   * Kilistázza az összes fájlt a basePath alatt rekurzívan,
   * és visszaadja azok adatait, metaadatokkal együtt.
   */
  async listFiles(): Promise<any[]> {
    // Összegyűjtjük az összes fájl abszolút útvonalát
    const files = await this.walkDirectory(this.basePath);

    // Az eredményként visszaadott fájlobjektumok ide kerülnek
    const results: {
      name: string;
      relativePath: string;
      size: string;
      modified: string;
      description: string;
      permissionLevel: number;
    }[] = [];

    // Fájlok feldolgozása egyenként
    for (const absPath of files) {
      const relative = path.relative(this.basePath, absPath);   // relatív útvonal a basePath-hez képest
      const stats = await fs.stat(absPath);                     // fájlstatisztika lekérése (méret, módosítási idő, stb.)

      // Metaadat beolvasása vagy alapértelmezett létrehozása
      if (!this.meta['Files'][relative]) {
        this.meta['Files'][relative] = {
          PermissionLevel: 0,
          Description: '',
          Exist: true,
        };
      } else {
        this.meta['Files'][relative].Exist = true;
      }

      const meta = this.meta['Files'][relative];

      // Az adott fájl adatai bekerülnek a visszatérési tömbbe
      results.push({
        name: path.basename(absPath),
        relativePath: relative,
        size: formatFileSize(stats.size),
        modified: stats.mtime.toISOString(),
        description: meta.Description,
        permissionLevel: meta.PermissionLevel,
      });
    }

    // Jelöld false-nak azokat, amik már nem léteznek
    for (const key of Object.keys(this.meta['Files'])) {
      if (!files.find(f => path.relative(this.basePath, f) === key)) {
        this.meta['Files'][key].Exist = false;
      }
    }

    // Visszaírhatjuk a meta fájlt, ha szükséges:
    await fs.writeJson(this.configPath, this.meta, { spaces: 2 });

    return results;
  }

  /**
   * Rekurzívan bejárja az adott könyvtárat, és visszaadja az összes fájl abszolút útvonalát.
   */
  private async walkDirectory(dir: string): Promise<string[]> {
    let fileList: string[] = [];
    const items = await fs.readdir(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = await fs.stat(fullPath);

      if (stat.isDirectory()) {
        const subFiles = await this.walkDirectory(fullPath);
        fileList = fileList.concat(subFiles);
      } else {
        fileList.push(fullPath);
      }
    }

    return fileList;
  }
}
