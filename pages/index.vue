<template>

    <h1 class="title">To-do List</h1>
    <div id="addNew">
        <UInput id="search-input" placeholder="Search.." trailing-icon="i-lucide-search" v-model="search">

        </UInput>
        <UButton @click="openAddTask" id="add-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
                <path fill="#d16914"
                    d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10s10-4.477 10-10S17.523 2 12 2m5 11h-4v4h-2v-4H7v-2h4V7h2v4h4z" />
            </svg>
        </UButton>
    </div>
    <!-- Add Task Modal -->
    <UModal v-model:open="openAddModal" title="Add New Task" class="modal" close-icon="zondicons:close-solid"
        :dismissible="false" @close="closeAddModal">
        <template #body>
            <UForm :state="state" class="modal-form" @submit="addTask">
                <UFormField label="Title" name="title" class="form-field" required>
                    <UInput class="title-input" v-model="state.title" size="xl"></UInput>
                </UFormField>
                <UFormField label="Description" name="desc" class="form-field">
                    <UTextarea v-model="state.desc" class="desc-input"></UTextarea>
                </UFormField>
                <UButton type="submit" class="modal-button" size="lg">Add</UButton>
            </UForm>
        </template>
    </UModal>
    <!-- Edit Task Modal -->
    <UModal v-model:open="openEditModal" title="Edit Task" class="modal" close-icon="zondicons:close-solid"
        :dismissible="false" @close="closeEditModal">
        <template #body>
            <UForm :state="state" class="modal-form">
                <UFormField label="Title" name="title" class="form-field">
                    <UInput class="title-input" v-model="state.title" size="xl"></UInput>
                </UFormField>
                <UFormField label="Description" name="desc" class="form-field">
                    <UTextarea v-model="state.desc" class="desc-input" size="xl"></UTextarea>
                </UFormField>
                <div class="button-group">
                    <UButton type="submit" class="modal-button" size="lg" @click="editTaskHandler"
                        leading-icon="fa-solid:edit">Edit
                    </UButton>
                    <UButton type="button" class="modal-delete-button" size="lg" @click="openConfirmDeleteModal"
                        leading-icon="material-symbols:delete-rounded">Delete
                    </UButton>
                    <UModal v-model:open="openConfirmDelete" title="Are you sure want to delete this task?"
                        class="confirm-modal" close-icon="zondicons:close-solid" :dismissible="false">
                        <template #body>
                            <div class="button-group">
                                <UButton type="button" class="modal-refuse-delete-button" size="lg"
                                    @click="closeConfirmDeleteModal">Cancel</UButton>
                                <UButton type="button" class="modal-accept-delete-button" size="lg"
                                    @click="deleteTaskHandler">
                                    Yes,
                                    Delete</UButton>
                            </div>
                        </template>
                    </UModal>
                </div>
            </UForm>
        </template>
    </UModal>
    <div class="task-list-title">
        <h1>All Task</h1>
        <div :style="{ opacity: 0.4 }">
            {{ (tasks && tasks.length) ? tasks.length : 0 }}
            <span>{{ ((tasks && tasks.length) ? tasks.length : 0) > 1 ? " tasks" : " task" }}</span>
        </div>
    </div>

    <!--Task List-->
    <div id="tasks">
        <template v-if="((tasks && tasks.length) ? tasks.length : 0) !== 0">
            <UCard v-for="task in filterTask" :key="task.id" class="task-item" @click="openEditTask(task)">
                <template #header>
                    <div class="task-item-title">{{ task.title }}</div>
                </template>
                <div class="task-item-content">
                    <p>{{ task.desc }}</p>
                    <span class="task-item-date">{{ task.date }}</span>
                </div>
            </UCard>
        </template>
    </div>


</template>

<script setup lang="ts">
import type { Task } from '~/types/tasks'
const openAddModal = ref(false)
const openEditModal = ref(false)
const openConfirmDelete = ref(false)
const selectedTaskId = ref<number | null>(null)
const message = ref<string | null>(null)
const state = reactive({
    title: '',
    desc: ''
})
const search = ref('')
const toast = useToast()
const { data: tasks } = await useFetch<Task[]>('http://localhost:3001/tasks', {
    default: () => []
})

const createTask = async () => {
    try {
        const newTask = await $fetch<Task>('http://localhost:3001/tasks', {
            method: 'POST',
            body: {
                title: state.title,
                desc: state.desc,
                date: new Date().toLocaleDateString()
            }
        })
        tasks.value.push(newTask)
    } catch (error) {
        console.error(error)
    }
}
const editTask = async (id: number) => {
    try {
        const oldTask = tasks.value.find(task => task.id === id)
        const updatedTask = await $fetch<Task>(`http://localhost:3001/tasks/${id}`, {
            method: 'PUT',
            body: {
                title: state.title,
                desc: state.desc,
                date: oldTask?.date
            }
        })
        const index = tasks.value.findIndex(task => task.id === id)
        tasks.value[index] = updatedTask
    } catch (error) {
        console.error(error)
    }
}
const deleteTask = async (id: number) => {
    try {
        await $fetch<Task>(`http://localhost:3001/tasks/${id}`, {
            method: 'DELETE'
        })
        tasks.value = tasks.value.filter(task => task.id !== id)
    } catch (error) {
        console.error(error)
    }
}
async function editTaskHandler() {
    if (!selectedTaskId.value) return
    if (!state.title) {
        toast.add({
            title: 'Error',
            icon: 'material-symbols:chat-error',
            description: 'Title is required',
            color: 'error'
        })
        return
    }
    try {
        await editTask(selectedTaskId.value)
        closeEditModal()
    } catch (error) {
        console.error(error)
    }
    resetForm()
}
async function deleteTaskHandler() {
    if (!selectedTaskId.value) return

    try {
        await deleteTask(selectedTaskId.value)
        closeEditModal()
    } catch (error) {
        console.error(error)
    }
}
async function addTask(event: Event) {
    event.preventDefault()
    if (!state.title) {
        toast.add({
            title: 'Error',
            icon: 'material-symbols:chat-error',
            description: 'Title is required',
            color: 'error'
        })
        return
    }
    const isExist = tasks.value.some(task => task.title === state.title)
    if (isExist) {
        toast.add({
            title: 'Error',
            icon: 'material-symbols:chat-error',
            description: 'Task with this title already exists',
            color: 'error'
        })
        return
    }
    try {
        await createTask()
        closeAddModal()
    } catch (error) {
        console.error(error)
    }
}
function openEditTask(task: Task) {
    selectedTaskId.value = task.id
    state.title = task.title
    state.desc = task.desc
    openEditModal.value = true
}
function resetForm() {
    state.title = ''
    state.desc = ''
    message.value = null
}
function closeAddModal() {
    openAddModal.value = false
    resetForm()
}
function closeEditModal() {
    openEditModal.value = false
    resetForm()
    selectedTaskId.value = null
}
function openAddTask() {
    openAddModal.value = true
    resetForm()
}

function openConfirmDeleteModal() {
    openConfirmDelete.value = true
}
function closeConfirmDeleteModal() {
    openConfirmDelete.value = false
}
const filterTask = computed(() => {
    if (!search.value.trim()) return tasks.value
    return tasks.value.filter(task => task.title.toLowerCase().includes(search.value.trim().toLowerCase()))
})
</script>
