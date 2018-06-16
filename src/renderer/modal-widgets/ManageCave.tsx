import { actions } from "common/actions";
import { getCaveSummary } from "common/butlerd";
import { Cave, Upload } from "common/butlerd/messages";
import { fileSize } from "common/format/filesize";
import { showInExplorerString } from "common/format/show-in-explorer";
import { formatUploadTitle } from "common/format/upload";
import { rendererWindow } from "common/util/navigation";
import React from "react";
import Button from "renderer/basics/Button";
import Cover from "renderer/basics/Cover";
import Icon from "renderer/basics/Icon";
import LastPlayed from "renderer/basics/LastPlayed";
import RowButton, {
  BigButtonContent,
  BigButtonRow,
  Tag,
} from "renderer/basics/RowButton";
import TimeAgo from "renderer/basics/TimeAgo";
import TotalPlaytime from "renderer/basics/TotalPlaytime";
import UploadIcon from "renderer/basics/UploadIcon";
import {
  actionCreatorsList,
  connect,
  Dispatchers,
} from "renderer/hocs/connect";
import { ModalWidgetDiv } from "renderer/modal-widgets/styles";
import styled from "renderer/styles";
import { T } from "renderer/t";
import { ModalWidgetProps } from "./index";

const CaveItem = styled.div`
  padding: 4px;

  display: flex;
  flex-direction: column;
  align-items: flex-start;

  .time-ago,
  .total-playtime {
    color: ${props => props.theme.secondaryText} !important;
  }
`;

const CaveDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const CaveDetailsRow = styled.div`
  padding: 8px 0;

  display: flex;
  flex-direction: row;
  align-items: center;

  &.smaller {
    font-size: 90%;
  }
`;

const Spacer = styled.div`
  height: 1px;
  width: 8px;
`;

const SpacerLarge = styled.div`
  height: 1px;
  width: 16px;
`;

const CaveItemBigActions = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  margin-bottom: 20px;

  & > * {
    margin-right: 4px;
  }
`;

const CaveItemActions = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  width: 100%;
  margin-top: 10px;

  & > * {
    margin-right: 4px;
  }
`;

const Title = styled.div`
  font-weight: bold;

  display: flex;
  flex-direction: row;
  align-items: center;
`;

const FileSize = styled.div`
  font-weight: normal;
`;

class ManageCave extends React.PureComponent<Props & DerivedProps> {
  render() {
    return <ModalWidgetDiv>{this.renderCave()}</ModalWidgetDiv>;
  }

  renderCave(): JSX.Element {
    const { cave } = this.props.modal.widgetParams;
    const { game } = cave;

    const u = cave.upload;
    const caveSummary = getCaveSummary(cave);
    return (
      <CaveItem key={cave.id}>
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <CaveDetails>
            <CaveDetailsRow>
              <Title>{formatUpload(u)}</Title>
            </CaveDetailsRow>
            <CaveDetailsRow className="smaller">
              <Icon icon="tag" />
              <Spacer />
              Published
              <Spacer />
              <TimeAgo date={u.createdAt} />
              <SpacerLarge />
              <Icon icon="install" />
              <Spacer />
              Installed
              <Spacer />
              <TimeAgo date={cave.stats.installedAt} />
            </CaveDetailsRow>
            <CaveDetailsRow className="smaller">
              <Icon icon="history" />
              <Spacer />
              <LastPlayed game={game} cave={caveSummary} />
              <SpacerLarge />
              <Icon icon="stopwatch" />
              <Spacer />
              <TotalPlaytime game={game} cave={caveSummary} />
            </CaveDetailsRow>
          </CaveDetails>
          <div style={{ width: "60px" }}>
            <Cover
              hover={false}
              gameId={game.id}
              coverUrl={game.coverUrl}
              stillCoverUrl={game.stillCoverUrl}
            />
          </div>
        </div>
        <CaveItemBigActions>
          <RowButton icon="folder-open" onClick={this.onExplore}>
            <BigButtonContent>
              <BigButtonRow>{T(showInExplorerString())}</BigButtonRow>
              <BigButtonRow>
                <Tag>{cave.installInfo.installFolder}</Tag>
                {cave.installInfo.installedSize ? (
                  <Tag>
                    <FileSize>
                      {fileSize(cave.installInfo.installedSize)}
                    </FileSize>
                  </Tag>
                ) : null}
              </BigButtonRow>
            </BigButtonContent>
          </RowButton>

          {u.channelName == "" ? (
            ""
          ) : (
            <RowButton icon="shuffle" onClick={this.onSwitchVersion}>
              {T(["grid.item.revert_to_version"])}
            </RowButton>
          )}
        </CaveItemBigActions>
        <CaveItemActions>
          <Button
            discreet
            icon="repeat"
            onClick={this.onReinstall}
            className="manage-reinstall"
          >
            {T(["prompt.uninstall.reinstall"])}
          </Button>
          <Button
            discreet
            icon="uninstall"
            onClick={this.onUninstall}
            className="manage-uninstall"
          >
            {T(["prompt.uninstall.uninstall"])}
          </Button>
        </CaveItemActions>
      </CaveItem>
    );
  }

  onSwitchVersion = (ev: React.MouseEvent<HTMLElement>) => {
    const cave = this.props.modal.widgetParams.cave;
    this.props.closeModal({
      window: rendererWindow(),
      action: actions.switchVersionCaveRequest({ cave }),
    });
  };

  onUninstall = (ev: React.MouseEvent<HTMLElement>) => {
    const caveId = this.props.modal.widgetParams.cave.id;
    this.props.closeModal({
      window: rendererWindow(),
      action: actions.queueCaveUninstall({ caveId }),
    });
  };

  onReinstall = (ev: React.MouseEvent<HTMLElement>) => {
    const caveId = this.props.modal.widgetParams.cave.id;
    this.props.closeModal({
      window: rendererWindow(),
      action: actions.queueCaveReinstall({ caveId }),
    });
  };

  onExplore = (ev: React.MouseEvent<HTMLElement>) => {
    const caveId = this.props.modal.widgetParams.cave.id;
    this.props.exploreCave({ caveId });
  };
}

export interface ManageCaveParams {
  cave: Cave;
}

interface Props extends ModalWidgetProps<ManageCaveParams, void> {}

const actionCreators = actionCreatorsList(
  "closeModal",
  "exploreCave",
  "manageCave"
);

type DerivedProps = Dispatchers<typeof actionCreators>;

export default connect<Props>(
  ManageCave,
  { actionCreators }
);

function formatUpload(upload: Upload): JSX.Element {
  return (
    <>
      <UploadIcon upload={upload} />
      <Spacer />
      {formatUploadTitle(upload)}
    </>
  );
}
