"use client"
import useConversation from "@/app/hooks/useConversations"
import { FullConversationType } from "@/app/types"
import clsx from "clsx"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { MdOutlineGroupAdd } from "react-icons/md"
import ConversationBox from "./ConversationBox"
import GroupChatModal from "./GroupChatModal"
import { User } from "@prisma/client"
import { useSession } from "next-auth/react"
import { pusherClient } from "@/app/libs/pusher"
import { find } from "lodash"

interface ConversationsListProps {
    initialItems: FullConversationType[]
    users: User[]
}

export default function ConversationsList({ initialItems, users }: ConversationsListProps) {
    const [items, setItems] = useState(initialItems)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const session = useSession()

    const router = useRouter()
    const { conversationId, isOpen } = useConversation()

    const pusherKey = useMemo(() => {
        return session?.data?.user?.email
    }, [session?.data?.user?.email])

    useEffect(() => {

        if (!pusherKey) { return }

        const newHandler = (conversation: FullConversationType) => {
            setItems(current => {
                if (find(current, { id: conversation.id })) {
                    return current
                }
                return [...current, conversation]
            })
        }

        const updateHandler = (conversation: FullConversationType) => {
            setItems((current) => current.map(currentConversation => {
                if (currentConversation.id === conversationId) {
                    return {
                        ...currentConversation, messages: conversation.messages
                    }
                }
                return currentConversation
            }))
        }

        const removeHandler = (conversation: FullConversationType) => {
            setItems((current) => [...current.filter(convs => convs.id !== conversation.id)])
            if (conversationId === conversation.id) {
                router.push('/conversations')
            }
        }

        pusherClient.subscribe(pusherKey)
        pusherClient.bind('conversation:new', newHandler)
        pusherClient.bind('conversation:update', updateHandler)
        pusherClient.bind('conversation:remove', removeHandler)

        return () => {
            pusherClient.unsubscribe(pusherKey)
            pusherClient.unbind('conversation:new', newHandler)
            pusherClient.unbind('conversation:update', updateHandler)
            pusherClient.unbind('conversation:remove', removeHandler)
        }

    }, [pusherKey, conversationId, router])

    return (
        <>
            <GroupChatModal users={users} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}></GroupChatModal>
            <aside className={clsx("fixed inset-y-0 pb-20 lg:pb-0 lg:left-20 lg:w-80 lg:block overflow-y-auto border-r border-gray-200", isOpen ? 'hidden' : 'block w-full left-0')}>
                <div className="px-5">
                    <div className="flex justify-between mb-4 pt-4">
                        <div className="text-2xl font-bold text-neutral-800">
                            Messages
                        </div>
                        <div onClick={() => { setIsModalOpen(true) }} className="rounded-full p-2 bg-gray-100 text-gray-600 cursor-pointer hover:opacity-75 transition">
                            <MdOutlineGroupAdd size={20}></MdOutlineGroupAdd>
                        </div>
                    </div>
                    {items.map((item) => (<ConversationBox key={item.id} data={item} selected={conversationId === item.id}></ConversationBox>))}
                </div>
            </aside>
        </>
    )
}