/** Play a cheerful "Meow" using the browser speech API. */

export function speakMeow() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance("Meow");
  utterance.rate = 1.05;
  utterance.pitch = 1.5;
  utterance.volume = 0.9;
  window.speechSynthesis.speak(utterance);
}
