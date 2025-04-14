const { userSignUp } = require("../controllers/userController");
const User = require("../models/users");

jest.mock("../models/users");

describe("User controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      send: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  })

  it("should throw an error if fields are missing", async () => {
    req.body = {
      firstName: "firstName",
      lastName: "",
      userName: "userName",
      phone: "1234",
      email: "john@gmail.com",
      password: "password",
    }
    await userSignUp(req, res);
    expect(res.json).toHaveBeenCalledWith({ status: false, message: "Please input all fields!" });
  })

  it("should throw an error when email already exists", async () => {
    User.findOne.mockResolvedValue({
      await: "jane@gmail.com"
    });

    req.body = {
      firstName: "firstName",
      lastName: "lastName",
      userName: "userName",
      phone: "1234",
      email: "jane@gmail.com",
      password: "password",
    }

    await userSignUp(req, res);

    expect(User.findOne).toHaveBeenCalledWith({email: "jane@gmail.com"});
    expect(res.json).toHaveBeenCalledWith({ status: false, message: "User already exist!" });
  })
})