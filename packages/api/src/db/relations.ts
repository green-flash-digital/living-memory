import { defineRelations } from "drizzle-orm";
import { schema } from "./schema/schema._.ts";

export const relations = defineRelations(schema, (r) => ({
  user: {
    sessions: r.many.session({ from: r.user.id, to: r.session.userId }),
    accounts: r.many.account({ from: r.user.id, to: r.account.userId }),
    invitations: r.many.invitation({ from: r.user.id, to: r.invitation.inviterId }),
    userHouseholds: r.many.userHousehold({ from: r.user.id, to: r.userHousehold.userId }),
    photos: r.many.photo({ from: r.user.id, to: r.photo.userId }),
    playlists: r.many.playlist({ from: r.user.id, to: r.playlist.createdById }),
    playlistSharesAsSharedWith: r.many.playlistShare({
      from: r.user.id,
      to: r.playlistShare.sharedWithUserId,
      alias: "SharedPlaylists"
    }),
    playlistSharesAsSharedBy: r.many.playlistShare({
      from: r.user.id,
      to: r.playlistShare.sharedByUserId,
      alias: "SharedByUser"
    })
  },

  session: {
    user: r.one.user({ from: r.session.userId, to: r.user.id })
  },

  account: {
    user: r.one.user({ from: r.account.userId, to: r.user.id })
  },

  household: {
    userHouseholds: r.many.userHousehold({ from: r.household.id, to: r.userHousehold.householdId }),
    invitations: r.many.invitation({ from: r.household.id, to: r.invitation.organizationId }),
    devices: r.many.device({ from: r.household.id, to: r.device.householdId }),
    photos: r.many.photo({ from: r.household.id, to: r.photo.householdId }),
    playlists: r.many.playlist({ from: r.household.id, to: r.playlist.householdId })
  },

  userHousehold: {
    user: r.one.user({ from: r.userHousehold.userId, to: r.user.id }),
    household: r.one.household({ from: r.userHousehold.householdId, to: r.household.id })
  },

  invitation: {
    household: r.one.household({ from: r.invitation.organizationId, to: r.household.id }),
    inviter: r.one.user({ from: r.invitation.inviterId, to: r.user.id })
  },

  device: {
    household: r.one.household({ from: r.device.householdId, to: r.household.id }),
    authorizations: r.many.deviceAuthorization({
      from: r.device.id,
      to: r.deviceAuthorization.deviceId
    })
  },

  deviceAuthorization: {
    device: r.one.device({ from: r.deviceAuthorization.deviceId, to: r.device.id })
  },

  photo: {
    user: r.one.user({ from: r.photo.userId, to: r.user.id }),
    household: r.one.household({ from: r.photo.householdId, to: r.household.id }),
    playlistItems: r.many.playlistItem({ from: r.photo.id, to: r.playlistItem.photoId })
  },

  playlist: {
    household: r.one.household({ from: r.playlist.householdId, to: r.household.id }),
    createdBy: r.one.user({ from: r.playlist.createdById, to: r.user.id }),
    items: r.many.playlistItem({ from: r.playlist.id, to: r.playlistItem.playlistId }),
    shares: r.many.playlistShare({ from: r.playlist.id, to: r.playlistShare.playlistId })
  },

  playlistItem: {
    playlist: r.one.playlist({ from: r.playlistItem.playlistId, to: r.playlist.id }),
    photo: r.one.photo({ from: r.playlistItem.photoId, to: r.photo.id })
  },

  playlistShare: {
    playlist: r.one.playlist({ from: r.playlistShare.playlistId, to: r.playlist.id }),
    sharedWith: r.one.user({
      from: r.playlistShare.sharedWithUserId,
      to: r.user.id,
      alias: "SharedPlaylists"
    }),
    sharedBy: r.one.user({
      from: r.playlistShare.sharedByUserId,
      to: r.user.id,
      alias: "SharedByUser"
    })
  }
}));
