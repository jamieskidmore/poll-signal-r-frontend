import { HubConnection } from "@microsoft/signalr";
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

export function Poll({ connection, pollProp }: { connection: HubConnection | undefined, pollProp: Poll }) {
    const [voted, setVoted] = useState(false)
    const [poll, setPoll] = useState<Poll>(pollProp)
    const [totalVotes, setTotalVotes] = useState(0)

    useEffect(() => {
        if (!connection) {
            return;
        }

        const handleReceiveVote = (updatedOption: Option) => {
            setPoll((previousPoll) => {
                const updatedOptions = previousPoll.options.map(option => {
                    if (option.id === updatedOption.id) {
                        return updatedOption;
                    }
                    return option; 
                });

                return { ...previousPoll, options: updatedOptions };
            });
        };

        connection.on("ReceiveVote", handleReceiveVote);

        return () => {
            connection.off("ReceiveVote");
        };
    }, [connection]);

    const handleVote = async (option: Option) => {
        try {
            setVoted(true)
            const updatedVoteCount = option.voteCount + 1
            await fetch(`/api/polls/${poll.id}/options/${option.id}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ ...option, voteCount: updatedVoteCount })
            });

            const allPollOptionsResult = await fetch(`/api/polls/${poll.id}/options`)
            const allPollOptions = await allPollOptionsResult.json();
            console.log(allPollOptions)

            let votes = 0
            allPollOptions.forEach((option: Option) => {
                console.log(option)
                votes = votes + +option.voteCount
                console.log("updates votes", votes)
            })
            console.log(votes)
            setTotalVotes(votes)

        } catch (error) {
            console.log("Error creating poll and options", error);
        }
    };

    return (
        <div className="mb-5 ">
            <h3 className="mt-2 mb-2 font-semibold">{poll.title}</h3>
            <p className="mt-2">{poll.description}</p>
            {poll.options && poll.options.length != 0 &&
                <div>
                {poll.options.map((option, index) => (
                    <div key={index} className="flex justify-start items-center space-y-2 space-x-5">
                        <div className="flex-1">
                            <label>{option.text}</label>
                        </div>
                        <div className="flex-1">
                            <div className="relative h-10 w-64">
                                <div style={{ width: `${(option.voteCount / totalVotes) * 100}%`, backgroundColor: 'black', height: '100%', position: 'absolute' }}></div>
                                <div className="border border-black absolute top-0 left-0 w-64 h-10 z-0"></div>
                            </div>
                        </div>
                        <div className="flex-1">
                        <button onClick={() => handleVote(option)} hidden={voted ? true : false}>Vote</button>
                        <p className="" hidden={voted ? false : true}>Votes: {option.voteCount}</p>
                        </div>
                     </div>
                ))}
            </div>}
        </div>
    )
}