import { FC } from "react";
import styled, { css } from "styled-components";

import { HelpTooltip } from "../../../../../components/Tooltip";
import { SETTINGS, Setting as SettingType } from "../../../../../settings";

const Settings = () => (
  <Wrapper>
    {SETTINGS.map((setting) => (
      <Setting key={setting.name} {...setting} />
    ))}
  </Wrapper>
);

const Wrapper = styled.div`
  ${({ theme }) => css`
    min-width: calc(
      ${theme.components.sidebar.left.default.width} +
        ${theme.components.sidebar.right.default.initialWidth}
    );
    background: ${theme.components.tooltip.bg};
    border: 1px solid ${theme.colors.default.border};
    border-radius: ${theme.default.borderRadius};
    box-shadow: ${theme.default.boxShadow};
  `}
`;

const Setting: FC<SettingType> = ({ name, Component, tooltip, isCheckBox }) => (
  <SettingWrapper isCheckBox={isCheckBox}>
    <Left>
      <SettingName>{name}</SettingName>
      {tooltip && <HelpTooltip {...tooltip} bgSecondary />}
    </Left>

    <Right>
      <Component />
    </Right>
  </SettingWrapper>
);

const SettingWrapper = styled.div<Pick<SettingType, "isCheckBox">>`
  ${({ theme, isCheckBox }) => css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    max-width: calc(
      ${theme.components.sidebar.left.default.width} +
        ${theme.components.sidebar.right.default.initialWidth}
    );
    padding: 1rem;

    &:not(:last-child) {
      border-bottom: 1px solid ${theme.colors.default.border};
    }

    ${!isCheckBox &&
    `& > div:last-child {
      width: 11.5rem;
    }`}
  `}
`;

const Left = styled.div`
  display: flex;

  & > :nth-child(2) {
    margin-left: 0.5rem;
  }
`;

const SettingName = styled.span``;

const Right = styled.div`
  margin-left: 1rem;
`;

export default Settings;
