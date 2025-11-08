import { useState, useEffect } from "react";
import { adminApi } from "../api/api";
import { FaUser, FaTrash, FaEdit, FaPlus, FaBan, FaUnlock, FaUsers, FaTasks, FaTrophy, FaGamepad } from "react-icons/fa";

interface User {
    id: number;
    name: string;
    login: string;
    email: string;
    avatar: string | null;
    role: string;
    is_banned: boolean;
    games_count: number;
    wins_count: number;
    created_at: string;
}

interface Task {
    id: number;
    title: string;
    description: string;
    input_example: string;
    output_example: string;
    difficulty: string;
    level: number;
    code_templates: any;
    supported_languages: number[];
    function_signature: string;
    test_cases: any;
    created_at: string;
}

interface Statistics {
    totalUsers: number;
    bannedUsers: number;
    totalTasks: number;
    totalGames: number;
    activeGames: number;
}

const Admin = () => {
    const [activeTab, setActiveTab] = useState<'users' | 'tasks' | 'statistics'>('statistics');
    const [users, setUsers] = useState<User[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [statistics, setStatistics] = useState<Statistics | null>(null);
    const [loading, setLoading] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [taskForm, setTaskForm] = useState({
        title: '',
        description: '',
        input_example: '',
        output_example: '',
        difficulty: 'easy',
        level: 1,
        code_templates: {} as any,
        supported_languages: [102, 109, 105, 107, 98, 91, 51],
        function_signature: '',
        test_cases: [] as any[]
    });

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'users') {
                const data = await adminApi.getUsers();
                setUsers(data);
            } else if (activeTab === 'tasks') {
                const data = await adminApi.getTasks();
                setTasks(data);
            } else if (activeTab === 'statistics') {
                const data = await adminApi.getStatistics();
                setStatistics(data);
            }
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBanUser = async (userId: number) => {
        try {
            await adminApi.banUser(userId);
            loadData();
        } catch (error) {
            console.error('Ошибка бана пользователя:', error);
        }
    };

    const handleUnbanUser = async (userId: number) => {
        try {
            await adminApi.unbanUser(userId);
            loadData();
        } catch (error) {
            console.error('Ошибка разбана пользователя:', error);
        }
    };

    const handleDeleteTask = async (taskId: number) => {
        if (!confirm('Вы уверены, что хотите удалить это задание?')) return;
        try {
            await adminApi.deleteTask(taskId);
            loadData();
        } catch (error) {
            console.error('Ошибка удаления задания:', error);
        }
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setTaskForm({
            title: task.title,
            description: task.description,
            input_example: task.input_example || '',
            output_example: task.output_example || '',
            difficulty: task.difficulty,
            level: task.level,
            code_templates: typeof task.code_templates === 'string' ? JSON.parse(task.code_templates) : task.code_templates,
            supported_languages: task.supported_languages,
            function_signature: task.function_signature || '',
            test_cases: typeof task.test_cases === 'string' ? JSON.parse(task.test_cases) : task.test_cases
        });
        setShowTaskModal(true);
    };

    const handleCreateTask = () => {
        setEditingTask(null);
        setTaskForm({
            title: '',
            description: '',
            input_example: '',
            output_example: '',
            difficulty: 'easy',
            level: 1,
            code_templates: {},
            supported_languages: [102, 109, 105, 107, 98, 91, 51],
            function_signature: '',
            test_cases: []
        });
        setShowTaskModal(true);
    };

    const handleSaveTask = async () => {
        try {
            if (editingTask) {
                await adminApi.updateTask(editingTask.id, taskForm);
            } else {
                await adminApi.createTask(taskForm);
            }
            setShowTaskModal(false);
            loadData();
        } catch (error) {
            console.error('Ошибка сохранения задания:', error);
        }
    };

    const addTestCase = () => {
        setTaskForm({
            ...taskForm,
            test_cases: [...taskForm.test_cases, { input: '', expected: '' }]
        });
    };

    const updateTestCase = (index: number, field: string, value: string) => {
        const newTestCases = [...taskForm.test_cases];
        newTestCases[index] = { ...newTestCases[index], [field]: value };
        setTaskForm({ ...taskForm, test_cases: newTestCases });
    };

    const removeTestCase = (index: number) => {
        setTaskForm({
            ...taskForm,
            test_cases: taskForm.test_cases.filter((_, i) => i !== index)
        });
    };

    const updateCodeTemplate = (languageId: string, code: string) => {
        setTaskForm({
            ...taskForm,
            code_templates: { ...taskForm.code_templates, [languageId]: code }
        });
    };

    const languageNames: { [key: number]: string } = {
        102: 'JavaScript',
        109: 'Python',
        105: 'C++',
        107: 'Go',
        98: 'PHP',
        91: 'Java',
        51: 'C#'
    };

    return (
        <div className="w-full h-screen-calc bg-primary-bg text-white p-6 overflow-auto">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Админ панель</h1>

                <div className="flex gap-4 mb-6 border-b border-primary-bdr">
                    <button
                        onClick={() => setActiveTab('statistics')}
                        className={`px-4 py-2 cursor-pointer ${activeTab === 'statistics' ? 'border-b-2 border-primary text-primary' : 'text-white/60 hover:text-white'}`}
                    >
                        Статистика
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 cursor-pointer ${activeTab === 'users' ? 'border-b-2 border-primary text-primary' : 'text-white/60 hover:text-white'}`}
                    >
                        Пользователи
                    </button>
                    <button
                        onClick={() => setActiveTab('tasks')}
                        className={`px-4 py-2 cursor-pointer ${activeTab === 'tasks' ? 'border-b-2 border-primary text-primary' : 'text-white/60 hover:text-white'}`}
                    >
                        Задания
                    </button>
                </div>

                {loading && (
                    <div className="text-center py-8">
                        <div className="text-white/60">Загрузка...</div>
                    </div>
                )}

                {!loading && activeTab === 'statistics' && statistics && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-secondary-bg border border-primary-bdr p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <FaUsers className="text-primary" size={24} />
                                <h3 className="text-lg font-semibold">Пользователи</h3>
                            </div>
                            <div className="text-3xl font-bold text-primary">{statistics.totalUsers}</div>
                            <div className="text-white/60 text-sm mt-2">Забанено: {statistics.bannedUsers}</div>
                        </div>
                        <div className="bg-secondary-bg border border-primary-bdr p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <FaTasks className="text-primary" size={24} />
                                <h3 className="text-lg font-semibold">Задания</h3>
                            </div>
                            <div className="text-3xl font-bold text-primary">{statistics.totalTasks}</div>
                        </div>
                        <div className="bg-secondary-bg border border-primary-bdr p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <FaGamepad className="text-primary" size={24} />
                                <h3 className="text-lg font-semibold">Игры</h3>
                            </div>
                            <div className="text-3xl font-bold text-primary">{statistics.totalGames}</div>
                            <div className="text-white/60 text-sm mt-2">Активных: {statistics.activeGames}</div>
                        </div>
                    </div>
                )}

                {!loading && activeTab === 'users' && (
                    <div className="bg-secondary-bg border border-primary-bdr">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-primary-bg border-b border-primary-bdr">
                                    <tr>
                                        <th className="px-4 py-3 text-left">ID</th>
                                        <th className="px-4 py-3 text-left">Имя</th>
                                        <th className="px-4 py-3 text-left">Логин</th>
                                        <th className="px-4 py-3 text-left">Email</th>
                                        <th className="px-4 py-3 text-left">Роль</th>
                                        <th className="px-4 py-3 text-left">Игры</th>
                                        <th className="px-4 py-3 text-left">Победы</th>
                                        <th className="px-4 py-3 text-left">Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-b border-primary-bdr hover:bg-primary-bg">
                                            <td className="px-4 py-3">{user.id}</td>
                                            <td className="px-4 py-3">{user.name}</td>
                                            <td className="px-4 py-3">{user.login}</td>
                                            <td className="px-4 py-3">{user.email}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 text-xs ${user.role === 'admin' ? 'bg-primary text-black' : 'bg-secondary-bg'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">{user.games_count || 0}</td>
                                            <td className="px-4 py-3">{user.wins_count || 0}</td>
                                            <td className="px-4 py-3">
                                                {user.role !== 'admin' && (
                                                    <button
                                                        onClick={() => user.is_banned ? handleUnbanUser(user.id) : handleBanUser(user.id)}
                                                        className={`px-3 py-1 text-sm cursor-pointer ${user.is_banned ? 'bg-greenDD text-black' : 'bg-redDD text-white'}`}
                                                    >
                                                        {user.is_banned ? <FaUnlock /> : <FaBan />}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {!loading && activeTab === 'tasks' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Задания</h2>
                            <button
                                onClick={handleCreateTask}
                                className="bg-primary text-black px-4 py-2 cursor-pointer hover:bg-primary/80 flex items-center gap-2"
                            >
                                <FaPlus /> Создать задание
                            </button>
                        </div>
                        <div className="space-y-4">
                            {tasks.map((task) => (
                                <div key={task.id} className="bg-secondary-bg border border-primary-bdr p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold mb-2">{task.title}</h3>
                                            <p className="text-white/60 mb-2">{task.description}</p>
                                            <div className="flex gap-2 text-sm">
                                                <span className={`px-2 py-1 ${task.difficulty === 'easy' ? 'bg-greenDD text-black' : task.difficulty === 'medium' ? 'bg-orangeDD text-black' : 'bg-redDD text-white'}`}>
                                                    {task.difficulty}
                                                </span>
                                                <span className="px-2 py-1 bg-primary-bg">Уровень: {task.level}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditTask(task)}
                                                className="bg-primary text-black px-3 py-1 cursor-pointer hover:bg-primary/80"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTask(task.id)}
                                                className="bg-redDD text-white px-3 py-1 cursor-pointer hover:bg-red-700"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {showTaskModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-primary-bg border border-primary-bdr max-w-4xl w-full max-h-[90vh] overflow-auto">
                            <div className="p-6">
                                <h2 className="text-2xl font-bold mb-4">
                                    {editingTask ? 'Редактировать задание' : 'Создать задание'}
                                </h2>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm mb-2">Название</label>
                                        <input
                                            type="text"
                                            value={taskForm.title}
                                            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                                            className="w-full bg-secondary-bg border border-primary-bdr text-white px-3 py-2"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm mb-2">Описание</label>
                                        <textarea
                                            value={taskForm.description}
                                            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                                            className="w-full bg-secondary-bg border border-primary-bdr text-white px-3 py-2 h-24"
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm mb-2">Пример входа</label>
                                            <input
                                                type="text"
                                                value={taskForm.input_example}
                                                onChange={(e) => setTaskForm({ ...taskForm, input_example: e.target.value })}
                                                className="w-full bg-secondary-bg border border-primary-bdr text-white px-3 py-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm mb-2">Пример выхода</label>
                                            <input
                                                type="text"
                                                value={taskForm.output_example}
                                                onChange={(e) => setTaskForm({ ...taskForm, output_example: e.target.value })}
                                                className="w-full bg-secondary-bg border border-primary-bdr text-white px-3 py-2"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm mb-2">Сложность</label>
                                            <select
                                                value={taskForm.difficulty}
                                                onChange={(e) => setTaskForm({ ...taskForm, difficulty: e.target.value })}
                                                className="w-full bg-secondary-bg border border-primary-bdr text-white px-3 py-2 cursor-pointer"
                                            >
                                                <option value="easy">Легкая</option>
                                                <option value="medium">Средняя</option>
                                                <option value="hard">Сложная</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm mb-2">Уровень</label>
                                            <input
                                                type="number"
                                                value={taskForm.level}
                                                onChange={(e) => setTaskForm({ ...taskForm, level: parseInt(e.target.value) })}
                                                className="w-full bg-secondary-bg border border-primary-bdr text-white px-3 py-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm mb-2">Сигнатура функции</label>
                                            <input
                                                type="text"
                                                value={taskForm.function_signature}
                                                onChange={(e) => setTaskForm({ ...taskForm, function_signature: e.target.value })}
                                                className="w-full bg-secondary-bg border border-primary-bdr text-white px-3 py-2"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm mb-2">Шаблоны кода</label>
                                        <div className="space-y-2">
                                            {taskForm.supported_languages.map((langId) => (
                                                <div key={langId}>
                                                    <label className="block text-xs mb-1">{languageNames[langId]}</label>
                                                    <textarea
                                                        value={taskForm.code_templates[langId] || ''}
                                                        onChange={(e) => updateCodeTemplate(String(langId), e.target.value)}
                                                        className="w-full bg-secondary-bg border border-primary-bdr text-white px-3 py-2 h-20 font-mono text-sm"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm">Тестовые случаи</label>
                                            <button
                                                onClick={addTestCase}
                                                className="bg-primary text-black px-3 py-1 text-sm cursor-pointer hover:bg-primary/80"
                                            >
                                                Добавить
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {taskForm.test_cases.map((testCase, index) => (
                                                <div key={index} className="flex gap-2 items-center">
                                                    <input
                                                        type="text"
                                                        placeholder="Вход"
                                                        value={testCase.input}
                                                        onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                                                        className="flex-1 bg-secondary-bg border border-primary-bdr text-white px-3 py-2"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Ожидаемый выход"
                                                        value={testCase.expected}
                                                        onChange={(e) => updateTestCase(index, 'expected', e.target.value)}
                                                        className="flex-1 bg-secondary-bg border border-primary-bdr text-white px-3 py-2"
                                                    />
                                                    <button
                                                        onClick={() => removeTestCase(index)}
                                                        className="bg-redDD text-white px-3 py-2 cursor-pointer hover:bg-red-700"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex gap-4 mt-6">
                                    <button
                                        onClick={handleSaveTask}
                                        className="bg-primary text-black px-6 py-2 cursor-pointer hover:bg-primary/80"
                                    >
                                        Сохранить
                                    </button>
                                    <button
                                        onClick={() => setShowTaskModal(false)}
                                        className="bg-secondary-bg border border-primary-bdr text-white px-6 py-2 cursor-pointer hover:bg-primary-bg"
                                    >
                                        Отмена
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admin;

