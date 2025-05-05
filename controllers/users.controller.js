import { Recipe, User, Follow, Favorite } from "../models/index.js";
import HttpError from "../helpers/HttpError.js";
import { fileURLToPath } from "url";
import path from "path";
import createDirIfNotExist from "../helpers/createDirIfNotExist.js";
import fs from "fs/promises";

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    next(err.status ? err : HttpError(500, err.message));
  }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultAvatar = "/public/images/avatars/default.png";

export const getCurrentUserInfo = async (req, res, next) => {
  try {
    const { id, name, email, avatarURL } = req.user; // user comes from auth
    let fullAvatarUrl = avatarURL;
    if (!avatarURL) fullAvatarUrl = path.join(__dirname, defaultAvatar);
    else if (!avatarURL.startsWith("http")) {
      fullAvatarUrl = path.join(__dirname, avatarURL);
    }
    console.log(fullAvatarUrl);
    const createdRecipes = await Recipe.count({ where: { ownerId: id } });
    const favorites = await Favorite.count({ where: { userId: id } });
    const followers = await Follow.count({ where: { followingId: id } });
    const following = await Follow.count({ where: { followerId: id } });
    res.status(200).json({
      user: { id, name, email, avatarURL: fullAvatarUrl },
      createdRecipes,
      favorites,
      followers,
      following,
    });
  } catch (err) {
    next(err.status ? err : HttpError(500, err.message));
  }
};

export const getUserInfo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) res.status(404).json("User not found");
    let avatarURL = user.avatarURL;
    if (!avatarURL) avatarURL = path.join(__dirname, defaultAvatar);
    else if (!avatarURL.startsWith("http")) {
      avatarURL = path.join(__dirname, avatarURL);
    }
    console.log(avatarURL);
    const createdRecipes = await Recipe.count({ where: { ownerId: id } });
    const favorites = await Favorite.count({ where: { userId: id } });
    const followers = await Follow.count({ where: { followingId: id } });
    res.status(200).json({
      user: {
        id,
        name: user.name,
        email: user.email,
        avatarURL,
      },
      createdRecipes,
      favorites,
      followers,
    });
  } catch (err) {
    next(err.status ? err : HttpError(500, err.message));
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
