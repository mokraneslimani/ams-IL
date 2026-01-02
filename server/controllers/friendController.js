const friendService = require("../services/friendService");

exports.getFriends = async (req, res) => {
  try {
    const q = req.query.q || "";
    const data = await friendService.listAllForUser(req.userId, q);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.sendRequest = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email requis" });

  try {
    const request = await friendService.sendRequest(req.userId, email);
    res.status(201).json(request);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.acceptRequest = async (req, res) => {
  const { requesterId } = req.params;
  try {
    const relation = await friendService.acceptRequest(req.userId, requesterId);
    res.json(relation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteFriend = async (req, res) => {
  const { friendId } = req.params;
  try {
    const result = await friendService.removeFriend(req.userId, friendId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
