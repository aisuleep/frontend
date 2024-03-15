import { JSX, createMemo, createSignal, onMount } from "solid-js";
import { For, Show } from "solid-js";
import { styled, useTheme } from "solid-styled-components";
import { getController } from "@revolt/common";

import { Avatar, Button, ColouredText, Column, Header, IconButton, OverflowingText, Row, Typography, UserStatusGraphic } from "../design";
import { API } from "revolt.js";
import { useTranslation } from "@revolt/i18n";
import { Markdown, TextWithEmoji } from "@revolt/markdown";
import { BiSolidChevronDown } from "solid-icons/bi";
import { scrollable } from "../../directives/scroll";

scrollable;

/**
 * Base element for the card
 */
const Base = styled("div", "Tooltip")`
  display: flex;
  flex-direction: column;
  color: ${(props) =>
props.theme!.colours["component-modal-foreground"]};
  background: ${(props) =>
props.theme!.colours["component-modal-background"]};
  border-radius: ${(props) => props.theme!.borderRadius.lg};
  width: 425px;
  height: 550px;
  overflow-y: clip;
  .header {
    display: flex;
    flex-direction: column;
    position: sticky;
    top: 0;
  }
`;

/**
 * User Card
 */
export function UserCard(
  props: JSX.Directives["floating"]["userCard"] & object
) {
  const t = useTranslation();
  
  const [profile, setProfile] = createSignal<API.UserProfile>();
  onMount(() => props.user.fetchProfile().then(setProfile));

  const status = () =>
    props.user?.statusMessage((presence) =>
      t(`app.status.${presence.toLowerCase()}`)
    );

  const roleIds = createMemo(
    () => new Set(props.member?.orderedRoles.map((role) => role.id))
  );
  
  // Disable it while it's being developed
  if (!getController("state").experiments.isEnabled("user_card")) return null;

  return (
    <Base>

      <div class="header">
        <ProfileBanner>
        <HeaderWithImage
            placement="secondary"
            style={{
              background: `url(https://autumn.revolt.chat/backgrounds/${profile()?.background?._id})`,
              height: "100%",
              width: "100%",
              margin: "0"
            }}
            >
            <ProfileDetails>
          <Avatar 
            src={props.user.animatedAvatarURL ?? props.user.avatarURL ?? props.user.defaultAvatarURL} 
            size={58}
            holepunch="bottom-right"
            overlay={<UserStatusGraphic status={props.user?.presence} />}
          />
          <div class="usernameDetails">
            {props.member!.nickname ?? props.user.username}
            <div class="username">
              {props.user.username}#{props.user.discriminator}
            </div>
            <div class="status">
              <TextWithEmoji content={status()!} />
            </div>
          </div>
        </ProfileDetails>
            </HeaderWithImage>
        </ProfileBanner>
            <Actions>
              <Show when={
                props.user.relationship != "Friend" 
                && props.user.relationship != "Outgoing" 
                && props.user.relationship != "Incoming" 
                && !props.user.self
                && !props.user.bot
              }>
                <Button
                  onClick={props.user.addFriend}
                >
                {t("app.context_menu.add_friend")}
                </Button>
              </Show>
              <Show when={props.user.relationship == "Incoming"
                }>
                <Button
                  onClick={() => {
                    // if (await action.onClick()) {
                    //   props.onClose?.();
                    // }
                  }}
                >
                {t("app.context_menu.add_friend")}
                </Button>
              </Show>
              <Show when={
                props.user.relationship == "Outgoing"
                || props.user.relationship == "Incoming"
                }>
                <Button
                  onClick={() => {
                    // if (await action.onClick()) {
                    //   props.onClose?.();
                    // }
                  }}
                >
                {t("app.context_menu.cancel_friend")}
                </Button>
              </Show>
              <Show when={
                props.user.relationship == "Friend" 
              }>
                <Button
                  onClick={() => {
                    // if (await action.onClick()) {
                    //   props.onClose?.();
                    // }
                  }}
                >
                {t("app.context_menu.message_user")}
                </Button>
              </Show>
              <Show when={props.user.bot}>
                <Button
                  onClick={() => {
                    // if (await action.onClick()) {
                    //   props.onClose?.();
                    // }
                  }}
                >
                {t("app.settings.pages.bots.add")}
                </Button>
              </Show>
            <IconButton>
              <BiSolidChevronDown size={24} />
            </IconButton>
          </Actions>
          <Divider />
        </div>
        <Column />
        <ProfileContent use:scrollable>
          <SmallCards>
            <SmallCard>
              <Title>
                <Typography variant="modal-title">
                  {t("app.settings.server_pages.roles.title")}
                </Typography>
              </Title>
              <For each={props.member!.orderedRoles}>
                {(role) => (
                  <Role>
                    <Title>
                      <Typography variant="modal-description">
                        {role.name}
                      </Typography>
                    </Title>
                    <div
                      onClick={() =>
                        props.member!.edit({
                          roles: [...roleIds()].filter((id) => id !== role.id),
                        })
                      }
                    >
                      <Dot
                        colour={role.colour ?? useTheme().colours["foreground"]}
                      />
                    </div>
                  </Role>
                )}
              </For>
            </SmallCard>
            <SmallCard>
              <Title>
                <Typography variant="modal-title">
                  {("Joined")}
                </Typography>
              </Title>
              <Title>
                <Typography variant="modal-description">
                  {props.user.createdAt.toLocaleDateString()}
                </Typography>
              </Title>
              <Title class="place">
                  {props.member?.server?.name}
              </Title>
              <Title>
                <Typography variant="modal-description">
                  {props.member?.joinedAt.toLocaleDateString()}
                </Typography>
              </Title>
              <Title class="place">
                  {"Revolt"}
              </Title>
            </SmallCard>
            <Show when={props.user.badges}>
              <SmallCard>
              <Title>
                <Typography variant="modal-title">
                  {t("app.special.popovers.user_profile.sub.badges")}
                </Typography>
              </Title>
            </SmallCard>
            </Show>
            
          </SmallCards>
          <Card>
            <Title>
                <Typography variant="modal-title">
                  {t("app.settings.pages.profile.info")}
                </Typography>
            </Title>
            <span class="text">
              <Show when={profile()?.content}>
                <Markdown content= {profile()!.content!}/>
              </Show>
              <Show when={!profile()?.content}>
                  <OverflowingText>
                      {t("app.special.popovers.user_profile.empty")}
                  </OverflowingText>
              </Show>
            </span>
          </Card>
        </ProfileContent>
    </Base>
  );
}

const ProfileDetails = styled.div`
  color: white;
  display: flex;
  align-items: end;
  gap: 15px;
  flex-grow: 1;
  padding: 16px;

  .usernameDetails {
    font-size: 18px;
    font-weight: 600;

  .username {
    font-size: 14px;
    font-weight: 400;
  }

  .status {
    font-size: 11px;
    font-weight: 400;
  }

  }
`;

const ProfileBanner = styled.div`
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  height: 150px;
  border-radius: ${(props) => props.theme!.borderRadius.lg};
`;

const Actions = styled.div`
  display: flex;
  justify-content: end;
  flex-direction: row;
  background: ${(props) =>
    props.theme!.colours["component-modal-background"]};
  gap: 8px;
  position: relative;
  padding: 8px 16px;
  flex-wrap: nowrap;
`;

const Divider = styled.div`
  height: 1px;
  /** margin: ${(props) => props.theme!.gap.sm} 16px 0px;**/
  background: ${(props) =>
    props.theme!.colours["component-context-menu-divider"]};
`;
const SmallCards = styled.div`
display: grid;
grid-template-columns: 1fr 1fr;
grid-template-rows: auto auto; 
gap: 8px;
`;

const Title = styled.div`
  display: flex;
  flex-direction: row;
`;

const Role = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 4px;
`;

const Dot = styled.span<{colour: string}>`
    color: ${(props) => props.colour};
    height: 16px;
    width: 16px;
    border-radius: 50%;
    -webkit-text-fill-color: "transparent";
    background-clip: "text";
    -webkit-background-clip: "text";
    outline: solid 2px blue;
`;

const SmallCard = styled.div`
  background: ${(props) => props.theme!.colours["component-btn-background-secondary"]};
  display: flex;
  flex-direction: column;
  height: 140px;
  border-radius: ${(props) => props.theme!.borderRadius.lg};
  padding: 16px;
  gap: 4px;

  .place {
    font-weight: 600;
  }
`;

const Card = styled.div`
  background: ${(props) => props.theme!.colours["component-btn-background-secondary"]};
  display: flex-flow;
  flex-direction: column;
  border-radius: ${(props) => props.theme!.borderRadius.lg};
  padding: 16px;
  height: 100vh;
  gap: 8px;
`;

const ProfileContent = styled.div`
  display: flex;
  flex-direction:column;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 0px 16px;
  padding-bottom: 16px;
  gap: 8px;
`;

const HeaderWithImage = styled(Header)`
  padding: 0;
  align-items: flex-end;

  > * {
    flex-grow: 1;
    background: linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.7),
    transparent
  );
  }
`;
