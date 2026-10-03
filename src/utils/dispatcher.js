// @ts-check

/**
 * @param {any} dispatcher
 * @returns {any[]}
 */
export function getDispatcherNodes(dispatcher) {
	const actionHandlers = dispatcher?._actionHandlers;
	const nodes = actionHandlers?._nodes;

	if (typeof nodes?.values === "function") {
		try {
			return Array.from(nodes.values());
		} catch {
			// Fall through to the legacy dependency graph.
		}
	}

	const legacyNodes = actionHandlers?._dependencyGraph?.nodes;
	if (Array.isArray(legacyNodes)) return legacyNodes;
	if (legacyNodes && typeof legacyNodes === "object") {
		return Object.values(legacyNodes);
	}

	return [];
}

/**
 * @param {any} store
 * @param {any} fallbackDispatcher
 * @returns {any}
 */
export function getStoreActionHandler(store, fallbackDispatcher) {
	const dispatchToken = store?._dispatchToken;
	if (dispatchToken == null) return undefined;

	const dispatcher = store?._dispatcher ?? fallbackDispatcher;
	const actionHandlers = dispatcher?._actionHandlers;
	const nodes = actionHandlers?._nodes;

	if (typeof nodes?.get === "function") {
		try {
			const handler = nodes.get(dispatchToken)?.actionHandler;
			if (handler !== undefined) return handler;
		} catch {
			// Fall through to the legacy dependency graph.
		}
	}

	const legacyNodes = actionHandlers?._dependencyGraph?.nodes;
	return legacyNodes?.[dispatchToken]?.actionHandler;
}
