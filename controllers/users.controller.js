import { User } from '../models/index.js';
import HttpError from '../helpers/HttpError.js';
import path from "path";
import createDirIfNotExist from "../helpers/createDirIfNotExist.js";
import fs from "fs/promises";

export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        next(HttpError(500, error.message));
    }
};

export const followUser = async (req, res, next) => {
  try {
    const follower = req.user; // set by auth middleware
    const { id: followingId } = req.params; // ID to follow

    if (follower.id === followingId) {
      throw HttpError(400, "You can't follow yourself");
    }

    const target = await User.findByPk(followingId);
    if (!target) {
      throw HttpError(404, "User to follow not found");
    }

    // ← here is the magic: no Follow model, just the mixin
    await follower.addFollowings(target);

    res.json({ message: `Now following user ${followingId}` });
  } catch (err) {
    next(err.status ? err : HttpError(500, err.message));
  }
};

export const unfollowUser = async (req, res, next) => {
  try {
    const follower = req.user;
    const { id: followingId } = req.params;

    if (follower.id === followingId) {
      throw HttpError(400, "You can't unfollow yourself");
    }

    const target = await User.findByPk(followingId);
    if (!target) {
      throw HttpError(404, "User to unfollow not found");
    }

    await follower.removeFollowings(target);

    res.json({ message: `Unfollowed user ${followingId}` });
  } catch (err) {
    next(err.status ? err : HttpError(500, err.message));
  }
};

export const changeAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "File upload error" });
    }
    const { path: tempPath, filename } = req.file;
    const avatarsDir = path.join(__dirname, "../public/images/avatars");
    await createDirIfNotExist(avatarsDir);
    const resultPath = path.join(avatarsDir, filename);
    await fs.rename(tempPath, resultPath);

    const avatarURL = `/avatars/${filename}`;
    req.user.avatarURL = avatarURL;
    await req.user.save();

    res.json({ avatarURL });
  } catch (err) {
    next(err);
  }
};
