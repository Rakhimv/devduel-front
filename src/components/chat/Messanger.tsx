import { useState, useEffect } from "react";
import Chat from "./Chat"
import ChatList from "./ChatList";
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';


interface MessangerProps {
    initialChatId?: string | null;
}

const Messanger = ({ initialChatId }: MessangerProps) => {
    const [chatId, setChatId] = useState<string | null>(initialChatId || null);

    useEffect(() => {
        setChatId(initialChatId || null);
    }, [initialChatId]);

    return (
        <PanelGroup autoSaveId={"dash"} direction="horizontal" className="w-full flex max-h-[calc(100vh-80px)]">
            <Panel
                defaultSize={20}
                minSize={20}
                maxSize={50}
                className='panel1 flex'>
                <ChatList setChatId={setChatId} />
            </Panel>
            <div className="relative w-[0px] h-[calc(100vh-80px)]">
                <PanelResizeHandle
                    className='absolute h-full top-0 right-0 min-w-[10px]  bg-transparent'>
                </PanelResizeHandle>
            </div>


            <Panel
                minSize={50}
                className='panel1 w-full'>
                <Chat chatId={chatId} setChatId={setChatId} />
            </Panel>

        </PanelGroup>
    )
}


export default Messanger;
