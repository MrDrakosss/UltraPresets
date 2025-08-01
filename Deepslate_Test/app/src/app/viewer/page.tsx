// app/page.tsx (vagy pages/index.tsx)
import StructureViewer from './StructureViewer'

export default function Home() {
  return (
    <main>
      <h1 className='font-bold'>Model viewer</h1>
      <StructureViewer />
    </main>
  )
}
