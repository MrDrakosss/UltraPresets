import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { formatFileSize } from '../utils/file.utils';
import { formatDateHu } from '../utils/file.utils';
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

    // Metaadat betöltése fájlból vagy inicializálása üres szerkezettel
    this.meta = fs.pathExistsSync(this.configPath)
      ? fs.readJsonSync(this.configPath)
      : { Files: {} };

    // Biztonság kedvéért inicializáljuk a "Files" kulcsot, ha hiányzik
    if (!this.meta.Files) {
      this.meta.Files = {};
    }
  }

  /**
   * Kilistázza az összes fájlt a basePath alatt rekurzívan,
   * és visszaadja azok adatait, metaadatokkal együtt.
   */
  async listFiles(): Promise<any[]> {
    const files = await this.walkDirectory(this.basePath); // Rekurzív fájlbejárás
    const existingPaths = new Set<string>();               // Fájlnevek gyors kereshetőségéhez
    const results: {
      name: string;
      relativePath: string;
      size: string;
      modified: string;
      description: string;
      permissionLevel: number;
    }[] = [];

    for (const absPath of files) {
      const relative = path.relative(this.basePath, absPath);
      existingPaths.add(relative);                         // Ezt használjuk később a létezés vizsgálatához

      const stats = await fs.stat(absPath);

      // Metaadat hozzáadása, ha még nem létezik
      if (!this.meta.Files[relative]) {
        this.meta.Files[relative] = {
          PermissionLevel: 0,
          Description: '',
          Exist: true,
        };
      } else {
        // Meglévő meta frissítése
        this.meta.Files[relative].Exist = true;
      }

      const meta = this.meta.Files[relative];

      results.push({
        name: path.basename(absPath),
        relativePath: relative,
        size: formatFileSize(stats.size),
        modified: formatDateHu(stats.mtime.toISOString()),
        description: meta.Description,
        permissionLevel: meta.PermissionLevel,
      });
    }

    // Metaadatban szereplő, de fizikailag már nem létező fájlok megjelölése
    for (const key of Object.keys(this.meta.Files)) {
      if (!existingPaths.has(key)) {
        this.meta.Files[key].Exist = false;
      }
    }

    // Visszaírjuk a frissített metaadatokat (akkor is, ha nem változott sok)
    await fs.writeJson(this.configPath, this.meta, { spaces: 2 });

    return results;
  }

  /**
   * Rekurzívan bejárja az adott könyvtárat, és visszaadja az összes fájl abszolút útvonalát.
   */
  private async walkDirectory(dir: string): Promise<string[]> {
    const fileList: string[] = [];
    const items = await fs.readdir(dir, { withFileTypes: true }); // gyorsabb, mint külön stat

    for (const item of items) {
      const fullPath = path.join(dir, item.name);

      if (item.isDirectory()) {
        const subFiles = await this.walkDirectory(fullPath);
        fileList.push(...subFiles);
      } else if (item.isFile()) {
        fileList.push(fullPath);
      }
    }

    return fileList;
  }
}
