const { createPost, redis } = require("../controllers/postController");
const { inavalidatePostsKeys } = require('../middleware/cacheMiddleware');

describe("Post controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {}
    };

    res = {
      send: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  it("returns error if a field is missing", async () => {
    req.body = {
      title: "title",
      category: "",
      body: "body"
    }

    await createPost(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ status: false, message: "Please input all fields!" });
  });

  afterAll(async () => {
    await redis.quit();
  })
});