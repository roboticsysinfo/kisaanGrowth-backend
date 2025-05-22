// helpers/chatRoom.js
exports.getChatRoomId = (user1Id, user1Type, user2Id, user2Type) => {
  return [user1Id + "_" + user1Type, user2Id + "_" + user2Type].sort().join("-");
};
