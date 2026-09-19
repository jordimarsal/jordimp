export const NIGHT_BOOTSTRAP =
  'try{var s=localStorage.getItem("jordimp-night");var n=s==="1"||(s===null&&window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches);if(n)document.documentElement.setAttribute("data-night","1")}catch(e){}';
