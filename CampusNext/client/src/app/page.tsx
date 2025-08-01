"use client";

import { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileIcon,
  Menu,
  Sun,
  Moon,
  File,
  Settings,
  User,
  ImageIcon,
  FileText,
  Folder,
  AudioLines,
  Video,
  Archive,
  Code,
  Presentation,
  BookOpenCheck,
  Download,
  Eye
} from 'lucide-react';
const files: {
  name: string;
  type: string;
  size: string;
  parent?: string | null;
  description?: string;
  modified?: string;
}[] = [
    { name: "Report.pdf", type: "pdf", size: "1.2MB", parent: null, description: "Éves pénzügyi jelentés", modified: "2025. 01. 01. 10:00" },
    { name: "Design.png", type: "image", size: "2.1MB", parent: null, description: "Weboldal design", modified: "2025. 01. 02. 09:15" },
    { name: "Presentation.pptx", type: "ppt", size: "3.5MB", parent: null, description: "Projekt bemutató", modified: "2025. 01. 03. 14:30" },
    { name: "Resume.docx", type: "doc", size: "0.8MB", parent: null, description: "Önéletrajz", modified: "2025. 01. 04. 11:45" },
    { name: "Budget.xlsx", type: "xls", size: "1.9MB", parent: null, description: "Költségvetés táblázat", modified: "2025. 01. 05. 08:00" },
    { name: "Contract.docx", type: "doc", size: "0.6MB", parent: null, description: "Szerződés sablon", modified: "2025. 01. 06. 17:10" },
    { name: "Logo.svg", type: "image", size: "0.4MB", parent: null, description: "Céges logó", modified: "2025. 01. 07. 12:00" },
    { name: "Manual.pdf", type: "pdf", size: "5.2MB", parent: null, description: "Felhasználói kézikönyv", modified: "2025. 01. 08. 16:20" },
    { name: "Meeting.mp4", type: "video", size: "20MB", parent: null, description: "Meeting felvétel", modified: "2025. 01. 09. 13:40" },
    { name: "Audio.mp3", type: "audio", size: "3.4MB", parent: null, description: "", modified: "2025. 01. 10. 15:25" },
    { name: "Notes.txt", type: "text", size: "0.2MB", parent: null, description: "Jegyzetek", modified: "2025. 01. 11. 10:05" },
    { name: "Schedule.ics", type: "calendar", size: "0.1MB", parent: null, description: "Naptárbejegyzés", modified: "2025. 01. 12. 07:55" },
    { name: "Photos", type: "folder", size: "-", parent: null, description: "Képek mappa" },
    { name: "Projects", type: "folder", size: "-", parent: null, description: "Projektek mappa" },
    { name: "Invoice.pdf", type: "pdf", size: "0.3MB", parent: null, description: "Számla dokumentum", modified: "2025. 01. 13. 18:00" },
    { name: "Concept.ai", type: "design", size: "2.0MB", parent: "Projects", description: "Koncepció fájl", modified: "2025. 01. 14. 10:30" },
    { name: "Mockup.psd", type: "design", size: "3.8MB", parent: "Projects", description: "PSD mockup fájl", modified: "2025. 01. 15. 09:45" },
    { name: "Thumbnail.jpg", type: "image", size: "0.5MB", parent: "Photos", description: "Indexkép", modified: "2025. 01. 16. 08:50" },
    { name: "Archive.zip", type: "archive", size: "10.5MB", parent: null, description: "TEz a fájl egy ZIP formátumú archívum, amely több projektfájlt tartalmaz tömörített formában.", modified: "2025. 01. 17. 19:20" },
    { name: "Script.js", type: "code", size: "0.1MB", parent: null, description: "JavaScript fájl", modified: "2025. 01. 18. 11:10" },
    { name: "Assets", type: "folder", size: "-", parent: "Projects", description: "Eset Endpoint Security telepítő készletek" },
    { name: "Images", type: "folder", size: "-", parent: "Assets", description: "Képek" },
    { name: "Logo.png", type: "image", size: "0.8MB", parent: "Images", description: "Logó képfájl", modified: "2025. 01. 19. 13:00" },
    { name: "Fonts", type: "folder", size: "-", parent: "Assets", description: "Betűk" },
    { name: "Roboto.ttf", type: "archive", size: "1.1MB", parent: "Fonts", description: "Roboto font", modified: "2025. 01. 20. 14:15" },
    { name: "Docs", type: "folder", size: "-", parent: "Projects", description: "Dokumentáció" },
    { name: "Readme.md", type: "text", size: "0.05MB", parent: "Docs", description: "README fájl", modified: "2025. 01. 21. 10:10" },
    { name: "Todo.txt", type: "text", size: "0.03MB", parent: "Docs", description: "Teendők lista", modified: "2025. 01. 22. 09:25" },
    { name: "Slides.key", type: "ppt", size: "2.4MB", parent: "Projects", description: "Előadás diák", modified: "2025. 01. 23. 17:00" },
    { name: "DesignSystem.fig", type: "design", size: "4.2MB", parent: "Projects", description: "Figma dizájn rendszer", modified: "2025. 01. 24. 12:00" },
    { name: "License.txt", type: "text", size: "0.02MB", parent: "Docs", description: "Licenc fájl", modified: "2025. 01. 25. 11:30" },
    { name: "ProjectPlan.pdf", type: "pdf", size: "1.3MB", parent: "Projects", description: "Projekt ütemterv", modified: "2025. 01. 26. 14:40" },
    { name: "Diagram.drawio", type: "design", size: "1.0MB", parent: "Projects", description: "Architektúra diagram", modified: "2025. 01. 27. 15:45" },
    { name: "API.md", type: "text", size: "0.2MB", parent: "Docs", description: "API dokumentáció", modified: "2025. 01. 28. 08:20" },
    { name: "Helpers.js", type: "code", size: "0.15MB", parent: "Projects", description: "Segédfüggvények", modified: "2025. 01. 29. 13:55" },
    { name: "UXNotes.txt", type: "text", size: "0.12MB", parent: "Docs", description: "UX jegyzetek", modified: "2025. 01. 30. 10:00" },

    { name: "Assets", type: "folder", size: "-", parent: null, description: "Eset Endpoint Security telepítő készletek" },
  ];

function getFileIcon(type: string) {
  switch (type) {
    case 'pdf':
    case 'text':
    case 'doc':
    case 'xls':
      return <FileText className="w-10 h-16" />;
    case 'image':
      return <ImageIcon className="w-10 h-10" />;
    case 'ppt':
      return <Presentation className="w-10 h-10" />;
    case 'video':
      return <Video className="w-10 h-10" />;
    case 'audio':
      return <AudioLines className="w-10 h-10" />;
    case 'archive':
      return <Archive className="w-10 h-10" />;
    case 'folder':
      return <Folder className="w-10 h-10" />;
    case 'design':
      return <BookOpenCheck className="w-10 h-10" />;
    case 'code':
      return <Code className="w-10 h-10" />;
    default:
      return <FileIcon className="w-10 h-10" />;
  }
}


export default function FileStorage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);


  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredFiles = files
    .filter(file => {
      const inCurrentFolder = currentFolder === null ? file.parent === null : file.parent === currentFolder;
      const matchSearch = file.name.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === "all" || file.type === filter;
      return inCurrentFolder && matchSearch && matchFilter;
    })
    .sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });




  const sidebarLinks = [
    { label: "Fájlok", icon: <File className="w-5 h-5" />, href: "#" },
    { label: "Beállítások", icon: <Settings className="w-5 h-5" />, href: "#" },
  ];

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <aside
        className={`transition-[width] duration-300 ${sidebarOpen ? 'w-64' : 'w-16'
          } bg-white dark:bg-gray-800 shadow-md h-screen p-2 flex flex-col justify-between`}
      >


        <div className="relative px-1">
          <div className="flex items-center justify-between mx-1">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-200 cursor-pointer"
            >
              <div className="relative w-5 h-5">
                {/* Vonal 1 */}
                <span
                  className={`absolute left-0 top-1/2 w-full h-0.5 bg-current transform transition duration-300 ${sidebarOpen ? 'rotate-45 translate-y-0' : '-translate-y-1'
                    }`}
                />
                {/* Vonal 2 */}
                <span
                  className={`absolute left-0 top-1/2 w-full h-0.5 bg-current transform transition duration-300 ${sidebarOpen ? '-rotate-45 translate-y-0' : 'translate-y-1'
                    }`}
                />
              </div>
            </button>

            {sidebarOpen && (
              <h2 className="text-lg font-bold ml-2 w-[180px] overflow-hidden text-right">
                <span
                  className={`inline-block transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 delay-200' : 'opacity-0 delay-0'
                    }`}
                >
                  CampusNext
                </span>
              </h2>



            )}

          </div>
          <hr className='my-4'></hr>

          <nav className="flex flex-col">
            {sidebarLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                className={`w-full flex items-center py-2 px-2.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium transition-all`}
              >
                <div className="min-w-5 flex justify-center items-center">
                  {link.icon}
                </div>
                <span
                  className={`ml-2 whitespace-nowrap overflow-hidden transition-all duration-300 ${sidebarOpen ? 'opacity-100 max-w-[180px]' : 'opacity-0 max-w-0'
                    }`}
                >
                  {link.label}
                </span>
              </a>

            ))}


          </nav>
        </div>

        {/* Profile dropdown */}
        <div ref={profileRef} className="relative px-1">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="w-full flex items-center py-2 px-2.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium transition-all"
          >
            {/* Ikon mindig fix szélességű konténerben */}
            <div className="min-w-5 flex justify-center items-center">
              <User className="w-5 h-5" />
            </div>

            {/* Szöveg animálva */}
            <span
              className={`ml-2 whitespace-nowrap overflow-hidden transition-all duration-300 ${sidebarOpen ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0'
                }`}
            >
              Profil
            </span>
          </button>


          {profileOpen && (
            <div className="absolute bottom-12 left-0 w-44 bg-white dark:bg-gray-700 rounded-md shadow-md z-10">
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm">Profil megtekintés</button>
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm">Kijelentkezés</button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {currentFolder && (
              <button
                onClick={() => setCurrentFolder(null)}
                className="text-sm px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition cursor-pointer"
              >
                ← Vissza
              </button>
            )}
            {currentFolder && (
              <div className="text-sm text-gray-600 dark:text-gray-300">
                / {currentFolder}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">

            <Input
              placeholder="Keresés..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
            <Select value={filter} onValueChange={setFilter}>
              <SelectItem value="all">Összes</SelectItem>
              <SelectItem value="folder">Mappa</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="image">Kép</SelectItem>
              <SelectItem value="ppt">Prezentáció</SelectItem>
              <SelectItem value="doc">Dokumentum</SelectItem>
            </Select>
          </div>
        </div>



        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
          {filteredFiles.map((file, i) => (
            <Card
              key={i}
              onClick={file.type === 'folder' ? () => setCurrentFolder(file.name) : undefined}
              className={`group relative flex flex-col items-center justify-start gap-1 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-center transition-all duration-200 ${file.type === 'folder' ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''
                }`}
            >
              {/* Hover overlay – fekete áttetsző háttérrel */}
              {file.type !== "folder" && (
                <div className="absolute inset-0 bg-black/85 rounded-lg z-10 opacity-0 group-hover:opacity-100 hover:outline-2 outline-white outline-solid transition-opacity duration-200 flex flex-col justify-between p-3">
                  {file.description ? (
                    <>
                      {/* Leírás felül */}
                      <div className="text-sm italic cursor-default text-white dark:text-gray-100 text-center select-none">
                        {file.description}
                      </div>

                      {/* Gombok alul, kisebb */}
                      <div className="flex justify-center gap-6">
                        <button
                          className="p-2 bg-blue-400 text-black rounded cursor-pointer shadow hover:scale-105 transition"
                          title="Megtekintés"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          className="p-2 bg-green-400 text-black rounded cursor-pointer shadow hover:scale-105 transition"
                          title="Letöltés"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    </>
                  ) : (
                    // Ha nincs leírás: gombok középen, nagyobban
                    <div className="flex flex-1 items-center justify-center gap-6">
                      <button
                        className="p-3 bg-blue-400 text-black rounded cursor-pointer shadow-lg hover:scale-110 transition"
                        title="Megtekintés"
                      >
                        <Eye className="w-6 h-6" />
                      </button>
                      <button
                        className="p-3 bg-green-400 text-black rounded cursor-pointer shadow-lg hover:scale-110 transition"
                        title="Letöltés"
                      >
                        <Download className="w-6 h-6" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Ikon */}
              <div className="mb-2 mt-4 z-0">{getFileIcon(file.type)}</div>

              {/* Fájlnév */}
              <p className="font-medium text-sm truncate w-full z-0">{file.name}</p>

              {/* Méret vagy elemszám */}
              <p className="text-xs text-gray-500 dark:text-gray-400 z-0 mb-2">
                {file.type === "folder"
                  ? `${files.filter(f => f.parent === file.name).length} elem`
                  : file.size}
              </p>

              {file.type === "folder" && (
                <div className="text-sm italic text-white dark:text-gray-100 text-center">
                  {file.description}
                </div>
              )}

              {/* Dátum jobb alsó sarokban */}
              {file.modified && (
                <p className="absolute bottom-2 right-2 text-[10px] text-gray-400 dark:text-gray-500 z-0">
                  {file.modified}
                </p>
              )}
            </Card>





          ))}
          {filteredFiles.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 col-span-full text-center">Nincs találat</p>
          )}
        </div>
      </main >
    </div >
  );
}
