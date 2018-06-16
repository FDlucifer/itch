import React from "react";

const Inspector = require("react-json-inspector");
import { ModalWidgetProps } from "./index";
import styled, * as styles from "renderer/styles";
import { ModalWidgetDiv } from "renderer/modal-widgets/styles";

class ExploreJson extends React.PureComponent<Props> {
  render() {
    const params = this.props.modal.widgetParams;
    const { data } = params;

    return (
      <ModalWidgetDiv>
        <JSONTreeContainer>
          <Inspector data={data} cacheResults={false} ignoreCase={true} />
        </JSONTreeContainer>
      </ModalWidgetDiv>
    );
  }
}

const JSONTreeContainer = styled.div`
  width: 100%;
  user-select: initial;

  .json-inspector__leaf_root {
    filter: brightness(150%);
  }

  input[type="search"] {
    ${styles.heavyInput()};
  }
`;

// props

export interface ExploreJsonParams {
  data: any;
}

export interface ExploreJsonResponse {}

interface Props
  extends ModalWidgetProps<ExploreJsonParams, ExploreJsonResponse> {}

export default ExploreJson;
