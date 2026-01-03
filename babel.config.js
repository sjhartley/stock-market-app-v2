module.exports = {
  presets: [
    "@babel/preset-env",
    "@babel/preset-react", // if using React
  ],
  plugins: [
    // Only remove console logs in production
    process.env.NODE_ENV === "production" && "transform-remove-console",
  ].filter(Boolean),
};
