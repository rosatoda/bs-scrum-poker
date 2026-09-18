export function randomRoomId(): string {
  return String(Math.floor(10000000 + Math.random() * 90000000));
}
