import { FC } from "react";
import styled, { css } from "styled-components";

import { PgTutorial, TutorialData } from "../../../../../../utils/pg";
import { PgThemeManager } from "../../../../../../utils/pg/theme";

const TutorialCard: FC<TutorialData> = ({
  name,
  description,
  imageSrc,
  categories,
}) => (
  <GradientWrapper onClick={() => PgTutorial.open(name)}>
    <InsideWrapper>
      <ImgWrapper>
        <Img src={imageSrc} />
      </ImgWrapper>
      <InfoWrapper>
        <Name>{name}</Name>
        <Description>
          {description.length < 70
            ? description
            : `${description.substring(0, 70)}...`}
        </Description>
        <CategoriesWrapper>
          {categories.slice(0, 3).map((c, i) => (
            <Category key={i}>{c}</Category>
          ))}
        </CategoriesWrapper>
      </InfoWrapper>
    </InsideWrapper>
  </GradientWrapper>
);

const GradientWrapper = styled.div`
  ${({ theme }) => css`
    --img-height: 15rem;

    padding: 0.25rem;
    width: 20rem;
    height: 24rem;
    position: relative;
    transform-style: preserve-3d;
    transition: transform ${theme.default.transition.duration.medium}
      ${theme.default.transition.type};

    &::after {
      content: "";
      position: absolute;
      transform: translateZ(-1px);
      height: 100%;
      width: 100%;
      inset: 0;
      margin: auto;
      border-radius: ${theme.default.borderRadius};
      background: linear-gradient(
        45deg,
        ${theme.colors.default.primary},
        ${theme.colors.default.secondary}
      );
      opacity: 0;
      transition: opacity ${theme.default.transition.duration.medium}
        ${theme.default.transition.type};
    }

    &:hover {
      cursor: pointer;
      transform: translateY(-0.5rem);

      & > div {
        background: ${theme.colors.state.hover.bg};
      }

      &::after {
        opacity: 1;
      }
    }

    ${PgThemeManager.convertToCSS(
      theme.components.main.views.tutorials.card.gradient
    )};
  `}
`;

const InsideWrapper = styled.div`
  ${({ theme }) => css`
    width: 100%;
    height: 100%;
    overflow: hidden;

    ${PgThemeManager.convertToCSS(
      theme.components.main.views.tutorials.card.default
    )};
  `}
`;

const ImgWrapper = styled.div`
  width: 100%;
  height: var(--img-height);
`;

const Img = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const InfoWrapper = styled.div`
  ${({ theme }) => css`
    width: 100%;
    height: calc(100% - var(--img-height));

    ${PgThemeManager.convertToCSS(
      theme.components.main.views.tutorials.card.info.default
    )};
  `}
`;

const Name = styled.div`
  ${({ theme }) => css`
    ${PgThemeManager.convertToCSS(
      theme.components.main.views.tutorials.card.info.name
    )};
  `}
`;

const Description = styled.div`
  ${({ theme }) => css`
    ${PgThemeManager.convertToCSS(
      theme.components.main.views.tutorials.card.info.description
    )};
  `}
`;

const CategoriesWrapper = styled.div`
  margin-top: 0.5rem;
  display: flex;
  gap: 1rem;
`;

const Category = styled.div`
  ${({ theme }) => css`
    ${PgThemeManager.convertToCSS(
      theme.components.main.views.tutorials.card.info.category
    )};
  `}
`;

export default TutorialCard;
