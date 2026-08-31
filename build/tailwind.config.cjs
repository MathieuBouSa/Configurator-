/* Config Tailwind du configurateur BETA — utilisée pour compiler
   vendor/tailwind.css (voir build/README-build.md) */
module.exports = {
  content: ["./index.html", "./js/**/*.js"],
  theme: {
    extend: {
      colors: {
        "salus-navy": "#1D2858",
        "salus-cyan": "#00AEEF",
        "salus-teal": "#3FB8A5",
        "salus-gray": "#A8A8A9"
      }
    }
  }
};
