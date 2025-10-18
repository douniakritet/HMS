module.exports = {
    content: ["./index.html","./src/**/*.{js,jsx,ts,tsx}"],
    theme: { extend: {} },
    plugins: [],
    safelist: [
        { pattern: /bg-(blue|green|red|purple)-500/ },
    ],
};
