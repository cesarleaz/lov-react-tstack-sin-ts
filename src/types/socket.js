export const SessionEventType = {
  Error: 'error',
  Done: 'done',
  Info: 'info',
  ImageGenerated: 'image_generated',
  VideoGenerated: 'video_generated',
  Delta: 'delta',
  ToolCall: 'tool_call',
  ToolCallArguments: 'tool_call_arguments',
  ToolCallResult: 'tool_call_result',
  AllMessages: 'all_messages',
  ToolCallProgress: 'tool_call_progress',
  ToolCallPendingConfirmation: 'tool_call_pending_confirmation',
  ToolCallConfirmed: 'tool_call_confirmed',
  ToolCallCancelled: 'tool_call_cancelled'
}
