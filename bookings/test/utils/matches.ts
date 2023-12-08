import {isDomainEvent, KnownEvents} from '../../src/domain/event'

export interface CustomMatcher {
    matches: (data: unknown) => boolean;
}
type Item = Record<string, unknown>
const isSubset: (sup: Item | undefined, sub: Item) => boolean =
    (superObj, subObj) => Object.keys(subObj).every(ele => {
        if (superObj === undefined) {
            return false
        }
        if (typeof subObj[ele] == 'object') {
            if (typeof superObj[ele] == 'object') {
                const subObject: Record<string, unknown> = subObj[ele] as Record<string, unknown>
                const superObjElement = superObj[ele] as Record<string, unknown>
                return isSubset(superObjElement, subObject)
            }
        }
        return subObj[ele] === superObj[ele]
    })

export class Matches {

    public static ofType(knownEvent: KnownEvents): CustomMatcher {
        return {
            matches: (data: unknown) => isDomainEvent(data) && data.__type === knownEvent,
        }
    }

    public static withPayload(key: string): CustomMatcher {
        return {matches: (data: unknown) => isDomainEvent(data) && key in data}
    }

    public static toSubset(supSet: Item): CustomMatcher {
        // @ts-ignore should fail easily
        return {matches: (data: unknown) => !!data && isSubset(data, supSet)}
    }
}
