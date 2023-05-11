import { Testing } from "cdktf"
import { server } from "./mocks/server"

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

Testing.setupJest()
