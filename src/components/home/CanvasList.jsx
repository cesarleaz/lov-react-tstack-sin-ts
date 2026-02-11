import CanvasCard from '@/components/home/CanvasCard'
import { useLocation } from 'wouter'
import { AnimatePresence, motion } from 'motion/react'
import { memo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import useCanvasesStore from '@/stores/server/canvases'

const CanvasList = () => {
  const { t } = useTranslation()
  const [location, navigate] = useLocation()
  const isHomePage = location === '/'
  const canvases = useCanvasesStore((state) => state.data)
  const fetchCanvases = useCanvasesStore((state) => state.fetchCanvases)

  useEffect(() => {
    if (!isHomePage) return
    fetchCanvases({ force: true })
  }, [isHomePage, fetchCanvases])
  const handleCanvasClick = (id) => {
    navigate(`/canvas/${id}`)
  }
  return (
    <div className="flex flex-col px-10 mt-10 gap-4 select-none max-w-[1200px] mx-auto">
      {canvases && canvases.length > 0 && (
        <motion.span
          className="text-2xl font-bold"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {t('home:allProjects')}
        </motion.span>
      )}

      <AnimatePresence>
        <div className="grid grid-cols-4 gap-4 w-full pb-10">
          {canvases?.map((canvas, index) => (
            <CanvasCard
              key={canvas.id}
              index={index}
              canvas={canvas}
              handleCanvasClick={handleCanvasClick}
              handleDeleteCanvas={() => fetchCanvases({ force: true })}
            />
          ))}
        </div>
      </AnimatePresence>
    </div>
  )
}
export default memo(CanvasList)
