import { Message, MessageAvatar, MessageContent } from "@/components/ballmac/ai-message"

export default function AiMessageDemo() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-6">
      <Message role="user">
        <MessageAvatar>YO</MessageAvatar>
        <MessageContent>How do I keep a chat scrolled to the newest message while it streams?</MessageContent>
      </Message>
      <Message role="assistant">
        <MessageAvatar>AI</MessageAvatar>
        <MessageContent>
          <p>
            Stick to the bottom only while the reader is already there. Track whether the scroll position is within a few
            pixels of the end; if it is, scroll down as new tokens arrive. If they scrolled up, leave them and show a
            &ldquo;jump to latest&rdquo; button instead.
          </p>
        </MessageContent>
      </Message>
    </div>
  )
}
