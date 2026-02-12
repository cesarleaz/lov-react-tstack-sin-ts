import { createCanvas } from '@/api/canvas'
import ChatTextarea from '@/components/chat/ChatTextarea'
import CanvasList from '@/components/home/CanvasList'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useConfigs } from '@/contexts/configs'
import { DEFAULT_SYSTEM_PROMPT } from '@/constants'
import { useLocation } from 'wouter'
import { motion } from 'motion/react'
import { useState } from 'react'
import { nanoid } from 'nanoid'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import TopMenu from '@/components/TopMenu'

export default function Home() {
  const [, navigate] = useLocation()
  const { t } = useTranslation()
  const { setInitCanvas } = useConfigs()
  const [isPending, setIsPending] = useState(false)

  const createCanvasMutation = async (payload) => {
    setIsPending(true)
    try {
      const { canvasId, details } = await createCanvas(payload)
      setInitCanvas(true)
      // navigate(`/canvas/${data.id}?sessionId=${payload.session_id}`)
      navigate(`/canvas?projectId=${canvasId}`)
    } catch (error) {
      toast.error(t('common:messages.error'), {
        description: error.message
      })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <ScrollArea className="h-full">
        <TopMenu />

        <div className="relative flex flex-col items-center justify-center h-fit min-h-[calc(100vh-460px)] pt-[60px] select-none">
          <h1 className="text-5xl font-bold mb-2 mt-8 text-center">
            {t('home:title')}
          </h1>
          <p className="text-xl text-gray-500 mb-8 text-center">
            {t('home:subtitle')}
          </p>

          <ChatTextarea
            className="w-full max-w-xl"
            messages={[]}
            onSendMessages={(messages, configs) => {
              createCanvasMutation({
                name: t('home:newCanvas'),
                canvas_id: nanoid(),
                messages: messages,
                session_id: nanoid(),
                text_model: configs.textModel,
                tool_list: configs.toolList,
                system_prompt:
                  localStorage.getItem('system_prompt') || DEFAULT_SYSTEM_PROMPT
              })
            }}
            pending={isPending}
          />
        </div>

        <CanvasList />
      </ScrollArea>
    </div>
  )
}
