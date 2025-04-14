const Redis = require("ioredis");
const redis = new Redis({ port: 58671, host: "localhost" });

const cacheMiddleware = async (req, res, next) => {
  try {
    let redisKey = `${req.method}:${req.originalUrl}:`;

    const cachedData = await redis.get(redisKey);
     if (cachedData) {
      console.log("Cached data");
      return res.status(200).json({
        status: true,
        message: "Operation successful",
        data: JSON.parse(cachedData),
      });
    }

    const originalSend = res.json;

    res.json = async function (body) {
      if (body && body.data && body.status !== false) {
        console.log("Storing data in Redis:", redisKey);
        await redis.set(redisKey, JSON.stringify(body.data), "EX", 60);
      }
      originalSend.call(this, body);
    };

    next();
  } catch (error) {
    console.error('Cache error:', error);
    next();
  }
}

const invalidateKeys = async (keys) => {
  for (let key of keys) {
    await redis.del(key);
    console.log(`Cache invalidated for key: ${key}`);
  }
};

const invalidateUsersKeys = async(user) => {
  try {
    const redisKeys = [
      `GET:/api/v1/users`,
      `GET:/api/v1/users/${user.id}`
    ];
  
    await invalidateKeys(redisKeys);
  } catch (error) {
    console.error('Cache error:', error);
  }
};

const invalidatePostsKeys = async(post) => {
  try {
    const redisKeys = [
      `GET:/api/v1/posts`,
      `GET:/api/v1/posts/${post.id}`,
      `GET:/api/v1/posts/title/${post.title}`,
      `GET:/api/v1/posts/category/${post.category}`,
    ];
  
    await invalidateKeys(redisKeys);
  } catch (error) {
    console.error('Cache error:', error);
  }
};

if (process.env.NODE_ENV === "test") {
  redis.quit();
}

module.exports = { cacheMiddleware, invalidateUsersKeys, invalidatePostsKeys, redis };