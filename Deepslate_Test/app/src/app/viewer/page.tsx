// app/page.tsx (vagy pages/index.tsx)
import StructureViewer from './StructureViewer'

export default function Home() {
  return (
    <main className='bg-red-100'>
      <h1>Deepslate Structure Viewer</h1>
      <StructureViewer />
    </main>
  )
}
