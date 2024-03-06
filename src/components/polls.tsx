import { HubConnection } from "@microsoft/signalr";
import { Poll } from "./poll"
import { useEffect, useState } from "react";

type Option = {
    id: number;
    text: string;
    voteCount: number;
    pollId: number;
}

type Poll = {
    id: number;
    title: string;
    description: string;
    createdAt: Date;
    options: Option[];
}

export function Polls({ connection }: { connection: HubConnection | undefined }) {
    const [polls, setPolls] = useState<Poll[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function getPolls() {
            const result = await fetch("/api/polls");
            const allPolls = await result.json();

            const optionsPromises = allPolls.map(async (poll: Poll) => {
                const optionsResult = await fetch(`/api/polls/${poll.id}/options`);
                const options = await optionsResult.json();
                return { ...poll, options: options };
            });

            const pollsWithOptions = await Promise.all(optionsPromises);
            pollsWithOptions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setPolls(pollsWithOptions);
            setIsLoading(false);
        }
        getPolls();
    }, []);

    useEffect(() => {
        if (!connection) {
            return;
        }

        const handleReceivePoll = async (newPoll: Poll) => {
            setTimeout(async () => {
                const newPollOptionsResult = await fetch(`/api/polls/${newPoll.id}/options`)
                const newPollOptions = await newPollOptionsResult.json();

                newPoll = { ...newPoll, options: newPollOptions };
                const newPolls = [...polls, newPoll];
                newPolls.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setPolls(newPolls);
            }, 1500);
        };
        connection.on("ReceivePoll", handleReceivePoll);

        return () => {
            connection.off("ReceivePoll");
        };
    }, [connection, polls]);

    return (
        <div>
            {isLoading ? 
                <>
                    <p>Loading...</p>
                </>
             : 
                polls.map((poll) => (
                    <Poll key={poll.id} connection={connection} pollProp={poll} />
                ))
            }
        </div>
    );
}
