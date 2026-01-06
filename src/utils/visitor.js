import { v4 as uuidv4 } from "uuid";

const KEY = "visitor-id";

export function getVisitorId() {
  let id = localStorage.getItem(KEY);

  if (!id) {
    id = uuidv4();
    localStorage.setItem(KEY, id);
  }

  return id;
}
