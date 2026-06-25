export default {
  // Global: ban bare [data-theme="dark"] — must use :root[data-theme="dark"] (spec 0,2,0 not 0,1,0)
  rules: {
    "selector-disallowed-list": [/(?<![:\w])\[data-theme="dark"\]/],
  },
  overrides: [
    {
      // Component CSS: no raw hex — use design tokens from base.css
      files: ["assets/components/**/*.css"],
      rules: {
        "color-no-hex": true,
        // Logical text-align — text-align:start is RTL-correct; text-align:left is not
        "declaration-property-value-disallowed-list": {
          "text-align": ["left"],
        },
      },
    },
    {
      // Diagram CSS: ban physical inline-axis props on the flow connector (use logical equivalents)
      files: ["assets/components/diagram/diagram.css"],
      rules: {
        "property-disallowed-list": ["left", "margin-left"],
      },
    },
  ],
};
