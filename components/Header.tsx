"use client"

import useOtherUser from "@/app/hooks/useOtherUser"
import { Conversation, User } from "@prisma/client"
import Link from "next/link"
import { useMemo, useState } from "react"
import { HiChevronLeft, HiEllipsisHorizontal } from "react-icons/hi2"
import Avatar from "./Avatar"
import ProfileDrawer from "./ProfileDrawer"
import AvatarGroup from "./AvatarGroup"
import useActiveList from "@/app/hooks/useActiveLists"

interface HeaderProps {
    conversation: Conversation & {
        users: User[]
    }
}

export default function Header({ conversation }: HeaderProps) {

    const otherUser = useOtherUser(conversation)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const {members} = useActiveList()
    const isActive = members.indexOf(otherUser?.email!) === -1

    const statusText = useMemo(() => {
        if (conversation.isGroup) {
            return `${conversation.users.length} members`
        }


        return isActive ? 'Active' : "offline";
    }, [conversation, isActive])

    return (
        <>
            <ProfileDrawer data={conversation} isOpen={drawerOpen} onClose={() => setDrawerOpen(false)}></ProfileDrawer>
            <div className="bg-white w-full flex border-b-[1px] sm:px-4 py-3 px-4 lg:px-6 justify-between items-center shadow-sm">
                <div className="flex gap-3 items-center">
                    <Link href='/conversations' className="lg:hidden block text-green-500 hover:text-green-600 transition cursor-pointer">
                        <HiChevronLeft size={32}></HiChevronLeft>
                    </Link>
                    {conversation.isGroup ? (<AvatarGroup users={conversation.users}></AvatarGroup>) : (<Avatar user={otherUser}></Avatar>)}
                    <div className="flex flex-col">
                        <div>
                            {conversation?.name || otherUser?.name}
                        </div>
                        <div className="text-sm font-light text-neutral-500">
                            {statusText}
                        </div>
                    </div>
                </div>
                <HiEllipsisHorizontal size={32} onClick={() => { setDrawerOpen(true) }} className="text-green-500 hover:text-green-600 cursor-pointer"></HiEllipsisHorizontal>
            </div>
        </>
    )
}