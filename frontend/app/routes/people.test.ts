import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "~/lib/api";
import { clientLoader as loadPeople } from "./people";
import { clientAction as profileAction } from "./person";
import { clientAction as connectionAction, clientLoader as loadConnections } from "./connections";

const mocks = vi.hoisted(() => ({
  requireMember: vi.fn(),
  getDiscoveryFilters: vi.fn(),
  searchMembers: vi.fn(),
  listRequests: vi.fn(),
  listConnections: vi.fn(),
  sendRequest: vi.fn(),
  acceptRequest: vi.fn(),
  declineRequest: vi.fn(),
  cancelRequest: vi.fn(),
}));

vi.mock("~/lib/runtime", () => ({ api: mocks }));
vi.mock("~/lib/session", () => ({
  requireMember: mocks.requireMember,
  withSession: (_request: Request, load: () => Promise<unknown>) => load(),
  useSessionMember: () => null,
}));

const requestFor = (path: string, fields: Record<string, string>) => new Request(`http://localhost${path}`, {
  method: "POST",
  body: new URLSearchParams(fields),
});

beforeEach(() => {
  vi.resetAllMocks();
  mocks.requireMember.mockResolvedValue({ id: "viewer" });
});

describe("people route boundary", () => {
  it("uses URL filters and a bounded API page instead of filtering a partial page in the browser", async () => {
    mocks.getDiscoveryFilters.mockResolvedValue({ countries: [], topics: [] });
    const page = { items: [], page: 2, pageSize: 10, totalItems: 15, totalPages: 2 };
    mocks.searchMembers.mockResolvedValue(page);
    const request = new Request("http://localhost/people?q=%20alumni%20&journey=living_abroad&country=Canada&topic=first-weeks&shared=1&page=2");
    const data = await loadPeople({ request } as Parameters<typeof loadPeople>[0]);
    expect(mocks.requireMember).toHaveBeenCalledWith(request);
    expect(mocks.searchMembers).toHaveBeenCalledWith({
      q: "alumni", journey: "living_abroad", country: "Canada", topic: "first-weeks", shared: true, page: 2,
    });
    expect(data.people).toBe(page);
  });

  it("does not return apparent data when the real member API is unavailable", async () => {
    const failure = new ApiError("unavailable", "Member service unavailable");
    mocks.getDiscoveryFilters.mockResolvedValue({ countries: [], topics: [] });
    mocks.searchMembers.mockRejectedValue(failure);
    await expect(loadPeople({ request: new Request("http://localhost/people") } as Parameters<typeof loadPeople>[0]))
      .rejects.toBe(failure);
  });
});

describe("profile and connection actions", () => {
  it("rejects an absent request id before sending an acceptance", async () => {
    const result = await profileAction({
      request: requestFor("/people/member-2", { intent: "accept", requestId: " " }),
      params: { memberId: "member-2" },
    } as Parameters<typeof profileAction>[0]);
    expect(result).toMatchObject({ ok: false, kind: "validation" });
    expect(mocks.acceptRequest).not.toHaveBeenCalled();
  });

  it("sends an introduction to the member in the route, and reports a conflict without success", async () => {
    mocks.sendRequest.mockRejectedValue(new ApiError("conflict", "This request already changed."));
    const result = await profileAction({
      request: requestFor("/people/member-2", { intent: "send-request", memberId: "other", introduction: " Hello " }),
      params: { memberId: "member-2" },
    } as Parameters<typeof profileAction>[0]);
    expect(mocks.sendRequest).toHaveBeenCalledWith("member-2", "Hello");
    expect(result).toMatchObject({ ok: false, kind: "conflict", message: "This request already changed." });
  });

  it("limits connections actions to existing requests and waits for server confirmation", async () => {
    const invalid = await connectionAction({
      request: requestFor("/connections", { intent: "send-request", memberId: "member-2" }),
    } as Parameters<typeof connectionAction>[0]);
    expect(invalid).toMatchObject({ ok: false, kind: "validation" });
    expect(mocks.sendRequest).not.toHaveBeenCalled();
    mocks.cancelRequest.mockResolvedValue(undefined);
    const result = await connectionAction({
      request: requestFor("/connections", { intent: "cancel", requestId: "request-1" }),
    } as Parameters<typeof connectionAction>[0]);
    expect(mocks.cancelRequest).toHaveBeenCalledWith("request-1");
    expect(result).toEqual({ ok: true, intent: "cancel" });
  });

  it("defaults an unknown connection view to received and loads each supported collection", async () => {
    mocks.listRequests.mockResolvedValue([]);
    mocks.listConnections.mockResolvedValue([]);
    const data = await loadConnections({
      request: new Request("http://localhost/connections?view=unknown"),
    } as Parameters<typeof loadConnections>[0]);
    expect(data.view).toBe("received");
    expect(mocks.listRequests.mock.calls).toEqual([["received"], ["sent"]]);
    expect(mocks.listConnections).toHaveBeenCalledOnce();
  });
});
