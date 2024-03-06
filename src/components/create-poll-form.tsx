import { useState, FormEvent, ChangeEvent } from 'react';

export function CreatePollForm() {
    const [description, setDescription] = useState<string>('');
    const [options, setOptions] = useState<string[]>(['', '']);
    const [title, setTitle] = useState<string>('');

    const minOptions: number = 2;
    const maxOptions: number = 7;

    const handleChangeTitle = (e: ChangeEvent<HTMLInputElement>): void => {
        const value: string = e.target.value;
        if (value.length <= 50) {
            setTitle(value);
        }
    };

    const handleChangeDescription = (e: ChangeEvent<HTMLTextAreaElement>): void => {
        const value: string = e.target.value;
        if (value.length <= 250) {
            setDescription(value);
        }
    };

    const handleChangeOption = (index: number, value: string): void => {
        if (value.length <= 50) {
            const newOptions: string[] = [...options];
            newOptions[index] = value;
            setOptions(newOptions);
        }
    };

    const handleAddOption = (): void => {
        if (options.length < maxOptions) {
            setOptions([...options, '']);
        }
    };

    const handleDeleteOption = (): void => {
        if (options.length > minOptions) {
            const newOptions: string[] = [...options];
            newOptions.splice(options.length - 1, 1);
            setOptions(newOptions);
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
        try {
            const pollResponse: Response = await fetch("/api/polls", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ title, description, options: [] })
            });

            const pollData: { id: string } = await pollResponse.json();

            const pollId: string = pollData.id;

            await Promise.all(
                options.map((optionText: string) =>
                    fetch(`/api/polls/${pollId}/options`, {
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ text: optionText, pollId })
                    }).then((response: Response) => response.json())
                )
            );
            setTitle('');
            setDescription('');
            setOptions(['', '']);
        } catch (error) {
            alert("Error creating poll and options");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                <input type="text" id="title" name="title" value={title} onChange={handleChangeTitle} required className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                {title.length > 50 && <p className="text-red-500">Title must be 50 characters or less</p>}
            </div>
            <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea id="description" name="description" value={description} onChange={handleChangeDescription} required className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"></textarea>
                {description.length > 250 && <p className="text-red-500">Description must be 250 characters or less</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Options</label>
                {options.map((option: string, index: number) => (
                    index < maxOptions &&
                    <div key={index} className="mb-2 flex items-center">
                        <label htmlFor={`option-${index}`} className="block text-sm font-medium text-gray-700 w-8 text-right mr-2">{index + 1}.</label>
                        <input type="text" id={`option-${index}`} name={`option-${index}`} value={option} onChange={(e) => handleChangeOption(index, e.target.value)} required className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                        {option.length > 50 && <p className="text-red-500">Option must be 50 characters or less</p>}
                    </div>
                ))}
            </div>
            <div className="flex flex-col">
                <div className="">
                    <button type="button" onClick={handleAddOption} className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md" hidden={options.length < maxOptions ? false : true}>+</button>
                    <button type="button" className="mt-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md" hidden={options.length > minOptions ? false : true} onClick={handleDeleteOption}>-</button>
                </div>
                {options.length >= maxOptions && <p className="mt-2">Maximum options reached</p>}

                <button type="submit" className="mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md">Create Poll</button>
            </div>
        </form>
    )
}
