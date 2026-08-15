/**
 * Thrown when the async code of an animation that was stopped (or restarted/reloaded) still tries to
 * use the scheduler or controlgroup it was given. AnimationManager cuts those objects off on stop, so
 * this error is the expected way dangling code dies: it unwinds the animation without letting it touch
 * anything of the animation that replaced it.
 *
 * It exists so this expected teardown noise can be told apart from a real bug in an animation:
 * see isAnimationStopped().
 *
 */
export class AnimationStopped extends Error {
    constructor(animationName: string, targetName: string, property: string) {
        super(`Animation '${animationName}' was stopped, but its code still tried to use ${targetName}.${property}`)
        this.name = "AnimationStopped"
    }
}

//true if this error (or the reason of a rejected promise) is just a stopped animation being cut off
export function isAnimationStopped(error: unknown): error is AnimationStopped {
    return error instanceof AnimationStopped
}

/**
 * Like Proxy.revocable(), but revoking makes the proxy throw AnimationStopped instead of a bare
 * "Cannot perform 'get' on a proxy that has been revoked" TypeError, so the error says which animation
 * was stopped and what it still tried to touch.
 *
 * NOTE: unlike Proxy.revocable() this keeps `target` reachable from the proxy. That doesnt matter for
 * the way AnimationManager uses it: the targets are its own long lived scheduler/controlgroup, only
 * the proxies around them are thrown away and recreated.
 */
export function stoppableProxy<T extends object>(target: T, targetName: string, animationName: () => string): {
    proxy: T,
    revoke: () => void
} {
    let stopped = false

    const throwIfStopped = (property: string | symbol) => {
        if (stopped)
            throw new AnimationStopped(animationName(), targetName, String(property))
    }

    const proxy = new Proxy(target, {
        get(target, property, receiver) {
            throwIfStopped(property)
            return Reflect.get(target, property, receiver)
        },
        set(target, property, value, receiver) {
            throwIfStopped(property)
            return Reflect.set(target, property, value, receiver)
        },
        has(target, property) {
            throwIfStopped(property)
            return Reflect.has(target, property)
        },
        deleteProperty(target, property) {
            throwIfStopped(property)
            return Reflect.deleteProperty(target, property)
        },
    })

    return {
        proxy,
        revoke: () => {
            stopped = true
        }
    }
}
