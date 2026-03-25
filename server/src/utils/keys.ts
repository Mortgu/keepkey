export function getKeyName(...args: string[]): string {
    return `bites:${args.join(':')}`;
}
