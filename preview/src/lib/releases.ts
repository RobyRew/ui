/** Sample rows for the table, LoadMore and archive demos: invented builds in
 *  the shape of the archive's ledger, nothing fetched. */
export interface SampleRelease {
  version: string;
  build: string;
  platform: 'windows' | 'apple' | 'linux' | 'android' | 'store';
  platformName: string;
  arch: string;
  format: string;
  date: string;
  size: string;
  likes: number;
  comments: number;
  official: 'ok' | 'warn' | 'danger' | 'unknown';
  archive: 'ok' | 'warn' | 'danger' | 'unknown';
}

const PLATFORMS = [
  ['windows', 'Windows', 'x64', 'exe'],
  ['apple', 'macOS', 'arm64', 'dmg'],
  ['linux', 'Linux', 'x64', 'deb'],
  ['android', 'Android', 'arm64', 'apk'],
  ['store', 'Store', 'x64', 'appx'],
] as const;

export function releases(count = 48): SampleRelease[] {
  const out: SampleRelease[] = [];
  for (let i = 0; i < count; i++) {
    const [platform, platformName, arch, format] = PLATFORMS[i % PLATFORMS.length]!;
    const minor = 60 - Math.floor(i / 5);
    const day = new Date(Date.UTC(2026, 10, 18) - i * 2.3 * 86400000);
    out.push({
      version: `1.2.${minor}`,
      build: `1.2.${minor}.${400 + ((i * 37) % 300)}`,
      platform,
      platformName,
      arch,
      format,
      date: day.toISOString().slice(0, 10),
      size: `${(88 + ((i * 7) % 30) + 0.4).toFixed(1)} MB`,
      likes: (i * 13) % 97,
      comments: (i * 5) % 23,
      official: i % 9 === 4 ? 'danger' : i % 7 === 3 ? 'warn' : 'ok',
      archive: i % 11 === 6 ? 'unknown' : 'ok',
    });
  }
  return out;
}
