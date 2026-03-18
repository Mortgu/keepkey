export function getKeyName(...args) {
    return `bites:${args.join(':')}`;
}