// thanks, chatgpt
export function ago(date) {
  const timeElapsed = Date.now() - date.getTime();
  const days = Math.floor(timeElapsed / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeElapsed % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((timeElapsed % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeElapsed % (1000 * 60)) / 1000);

  let result = "";
  if (days) {
    result += `${days} day${days === 1 ? "" : "s"} `;
  }
  if (hours || minutes || seconds) {
    result += `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return result.trim();
}
