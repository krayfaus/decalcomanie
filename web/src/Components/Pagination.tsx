function Pagination() {
    return (
        <div className="flex justify-end items-end mt-12">
            <div className="flex flex-row items-center justify-center space-x-8">
                <button className="text-base leading-none text-gray-800 border-b-2 border-transparent focus:outline-none focus:border-gray-800">
                    <p>1</p>
                </button>
                <button className="text-base leading-none text-gray-800 border-b-2 border-transparent focus:outline-none focus:border-gray-800">
                    <p>2</p>
                </button>
                <button className="text-base leading-none text-gray-800 border-b-2 border-transparent focus:outline-none focus:border-gray-800">
                    <p>3</p>
                </button>
                <button className="flex justify-center items-center">
                    <svg
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M9 6L15 12L9 18"
                            stroke="#1F2937"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
}
