import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { formatFileSize } from '../utils/file.utils';
import { formatDateHu } from '../utils/file.utils';
import * as fs from 'fs-extra';
import * as path from 'path';

@Injectable()
export class FileService {
  private basePath: string;
  private configPath: string;
  private meta: any;

  constructor(private configService: ConfigService) {
    this.basePath = this.configService.get<string>('BASE_PATH') ?? '';
    this.configPath = this.configService.get<string>('FILE_CONFIG_PATH') ?? '';
  }

  /**
   * Betölti vagy inicializálja a metaadat fájlt (config.json)
   */
  private async loadMeta(): Promise<void> {
    const exists = await fs.pathExists(this.configPath);
    this.meta = exists ? await fs.readJson(this.configPath) : { Files: {} };

    if (!this.meta.Files) {
      this.meta.Files = {};
    }
  }

  /**
   * Rekurzívan bejárja a megadott könyvtárat, és visszaadja az összes fájl abszolút elérési útját.
   */
  private async walkDirectory(dir: string): Promise<string[]> {
    const fileList: string[] = [];
    const items = await fs.readdir(dir, { withFileTypes: true });

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

  /**
   * Kilistázza a fájlokat a basePath könyvtárban metaadatokkal együtt
   */
  async listFiles(): Promise<any[]> {
    await this.loadMeta(); // mindig a legfrissebb meta fájl alapján dolgozunk

    const files = await this.walkDirectory(this.basePath);
    const existingPaths = new Set<string>();
    const results: {
      name: string;
      relativePath: string;
      size: string;
      modified: string;
      description: string;
      permissionLevel: number;
    }[] = [];
    const invalidFiles: string[] = [];

    for (const absPath of files) {
      const relative = path.relative(this.basePath, absPath).replace(/\\/g, '/');
      existingPaths.add(relative);

      const stats = await fs.stat(absPath);

      if (!this.meta.Files[relative]) {
        this.meta.Files[relative] = {
          PermissionLevel: 0,
          Description: '',
          Exist: true,
        };
      } else {
        this.meta.Files[relative].Exist = true;
      }

      const meta = this.meta.Files[relative];

      if (![0, 1, 2].includes(meta.PermissionLevel)) {
        invalidFiles.push(relative);
      }

      results.push({
        name: path.basename(absPath),
        relativePath: relative,
        size: formatFileSize(stats.size),
        modified: formatDateHu(stats.mtime),
        description: meta.Description,
        permissionLevel: meta.PermissionLevel,
      });
    }

    // ⛔ Hibás fájlok esetén dobunk 400-at
    if (invalidFiles.length > 0) {
      throw new BadRequestException(
        `Invalid PermissionLevel for files: ${invalidFiles.join(', ')}`
      );
    }

    // Jelöld false-ra azokat, amelyek a config.json-ben vannak, de már nem léteznek
    for (const key of Object.keys(this.meta.Files)) {
      if (!existingPaths.has(key)) {
        this.meta.Files[key].Exist = false;
      }
    }

    // Metaadatok visszaírása
    await fs.writeJson(this.configPath, this.meta, { spaces: 2 });

    return results;
  }
}
