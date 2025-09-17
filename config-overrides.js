module.exports = function override(config, env) {
    return config;
};

module.exports.devServer = function (configFunction) {
    return function (proxy, allowedHost) {
        const config = configFunction(proxy, allowedHost);

        return {
            ...config,
            host: '0.0.0.0',  // ✅ No space here
        };
    };
};
