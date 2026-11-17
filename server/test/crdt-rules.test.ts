import { describe, expect, it } from "vitest";
import * as Y from "yjs";

// "Decision tests": they don't test OUR code, they pin down how the CRDT
// resolves conflicts for the data shape we chose (one nested Y.Map per item).
// If we ever change the data shape or upgrade Yjs, these tell us whether the
// behavior our users rely on still holds.

/** Exchange full state both ways, like two phones reconnecting. */
function sync(a: Y.Doc, b: Y.Doc) {
  Y.applyUpdate(b, Y.encodeStateAsUpdate(a));
  Y.applyUpdate(a, Y.encodeStateAsUpdate(b));
}

function addItem(doc: Y.Doc, id: string, fields: Record<string, string>) {
  const item = new Y.Map<string>();
  for (const [k, v] of Object.entries(fields)) item.set(k, v);
  doc.getMap<Y.Map<string>>("items").set(id, item);
}

const items = (doc: Y.Doc) => doc.getMap("items").toJSON();

describe("offline conflict rules", () => {
  it("delete wins over a concurrent edit (one buys Milk, the other deletes it)", () => {
    const you = new Y.Doc();
    const partner = new Y.Doc();
    addItem(you, "milk", { name: "Milk", status: "approved" });
    sync(you, partner);

    // Both offline:
    (you.getMap("items").get("milk") as Y.Map<string>).set("status", "bought");
    partner.getMap("items").delete("milk");

    sync(you, partner);
    expect(items(you)).toEqual({});
    expect(items(partner)).toEqual({});
  });

  it("edits to DIFFERENT fields of the same item are both kept", () => {
    const you = new Y.Doc();
    const partner = new Y.Doc();
    addItem(you, "eggs", { name: "Eggs", status: "approved", quantity: "6" });
    sync(you, partner);

    (you.getMap("items").get("eggs") as Y.Map<string>).set("status", "bought");
    (partner.getMap("items").get("eggs") as Y.Map<string>).set("quantity", "12");

    sync(you, partner);
    expect(items(you)).toEqual({ eggs: { name: "Eggs", status: "bought", quantity: "12" } });
    expect(items(partner)).toEqual(items(you));
  });

  it("items added offline on both devices all survive the merge", () => {
    const you = new Y.Doc();
    const partner = new Y.Doc();
    addItem(you, "coffee", { name: "Coffee" });
    addItem(partner, "bread", { name: "Bread" });

    sync(you, partner);
    expect(Object.keys(items(you)).sort()).toEqual(["bread", "coffee"]);
    expect(items(partner)).toEqual(items(you));
  });

  it("applying the same update twice changes nothing (idempotent)", () => {
    const doc = new Y.Doc();
    addItem(doc, "milk", { name: "Milk" });
    const update = Y.encodeStateAsUpdate(doc);

    const copy = new Y.Doc();
    Y.applyUpdate(copy, update);
    Y.applyUpdate(copy, update);
    expect(items(copy)).toEqual(items(doc));
  });
});
