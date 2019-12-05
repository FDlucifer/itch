import { createGlobalStyle } from "renderer/styles";
import reset from "renderer/global-styles/reset";
import base from "renderer/global-styles/base";
import scroll from "renderer/global-styles/scroll";
import hint from "renderer/global-styles/hint";

const GlobalStyles = createGlobalStyle`
    ${reset}
    ${base}
    ${scroll}
    ${hint}
`;

export default GlobalStyles;
