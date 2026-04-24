import { useRef } from "react";
import { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import { v4 as uuid } from "uuid";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#a855f7"];

export default function TodoBoard() {
  const [board, setBoard] = useState<any>({
    columns: {},
    columnOrder: [],
  });

  const [newTask, setNewTask] = useState("");
  const [selected, setSelected] = useState<any>(null);

  // 🔥 PIC USERS
  const [users, setUsers] = useState<any[]>([]);

  // 🔥 tambahan untuk rename
  const [editingCol, setEditingCol] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState("");

  // ======================
  // LOAD USERS (BARU)
  // ======================
  useEffect(() => {
  fetch("/api/users/public")
      .then((res) => res.json())
      .then(setUsers)
      .catch(console.error);
  }, []);

  // ======================
  // LOAD
  // ======================
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const res = await fetch("/api/board");
        if (!res.ok) throw new Error("Fetch failed");

        const data = await res.json();

        if (!mounted) return;

        if (data) {
          const seen = new Set();

          Object.keys(data.columns).forEach((colId) => {
            data.columns[colId].items = data.columns[colId].items.filter((item: any) => {
              if (seen.has(item.id)) return false;
              seen.add(item.id);
              return true;
            });
          });

          setBoard(data);
        } else {
          setBoard({
            columns: {
              todo: { id: "todo", title: "Todo", items: [] },
              progress: { id: "progress", title: "In Progress", items: [] },
              done: { id: "done", title: "Done", items: [] },
            },
            columnOrder: ["todo", "progress", "done"],
          });
        }
      } catch (err) {
        console.error("LOAD ERROR:", err);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  // ======================
  // SAVE
  // ======================
  const isSaving = useRef(false);

  useEffect(() => {
    if (!board.columnOrder.length) return;
    if (isSaving.current) return;

    const save = async () => {
      try {
        isSaving.current = true;

        const res = await fetch("/api/board", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: board }),
        });

        if (!res.ok) {
          console.error("SAVE FAILED:", res.status);
        }

      } catch (err) {
        console.error("SAVE ERROR:", err);
      } finally {
        setTimeout(() => {
          isSaving.current = false;
        }, 300);
      }
    };

    save();
  }, [board]);

  // ======================
  // ADD TASK
  // ======================
  const addTask = () => {
    if (!newTask.trim()) return;

    const task = {
      id: uuid(),
      content: newTask,
      notes: "",
      dueDate: "",
      color: COLORS[0],
      pic: "", // 🔥 TAMBAHAN
    };

    setBoard((prev: any) => ({
      ...prev,
      columns: {
        ...prev.columns,
        todo: {
          ...prev.columns.todo,
          items: [...prev.columns.todo.items, task],
        },
      },
    }));

    setNewTask("");
  };

  // ======================
  // ADD COLUMN
  // ======================
  const addColumn = () => {
    const id = uuid();

    setBoard((prev: any) => ({
      columns: {
        ...prev.columns,
        [id]: { id, title: "New List", items: [] },
      },
      columnOrder: [...prev.columnOrder, id],
    }));
  };

  // ======================
  // DELETE TASK
  // ======================
  const deleteTask = (taskId: string) => {
    setBoard((prev: any) => {
      const newCols = { ...prev.columns };

      Object.keys(newCols).forEach((colId) => {
        newCols[colId].items = newCols[colId].items.filter(
          (t: any) => t.id !== taskId
        );
      });

      return { ...prev, columns: newCols };
    });
  };

  // ======================
  // DELETE COLUMN
  // ======================
  const deleteColumn = (colId: string) => {
    setBoard((prev: any) => {
      const newCols = { ...prev.columns };
      delete newCols[colId];

      const newOrder = prev.columnOrder.filter((id: string) => id !== colId);

      return {
        columns: newCols,
        columnOrder: newOrder,
      };
    });
  };

  // ======================
  // RENAME COLUMN
  // ======================
  const saveColumnTitle = (colId: string) => {
    setBoard((prev: any) => ({
      ...prev,
      columns: {
        ...prev.columns,
        [colId]: {
          ...prev.columns[colId],
          title: tempTitle || prev.columns[colId].title,
        },
      },
    }));

    setEditingCol(null);
  };

  // ======================
  // DRAG
  // ======================
  const onDragEnd = (result: any) => {
    const { source, destination, type } = result;
    if (!destination) return;

    if (type === "column") {
      setBoard((prev: any) => {
        const newOrder = Array.from(prev.columnOrder);
        const [removed] = newOrder.splice(source.index, 1);
        newOrder.splice(destination.index, 0, removed);
        return { ...prev, columnOrder: newOrder };
      });
      return;
    }

    setBoard((prev: any) => {
      const sourceCol = prev.columns[source.droppableId];
      const destCol = prev.columns[destination.droppableId];

      const sourceItems = Array.from(sourceCol.items);
      const destItems = Array.from(destCol.items);

      const [moved] = sourceItems.splice(source.index, 1);

      if (source.droppableId === destination.droppableId) {
        sourceItems.splice(destination.index, 0, moved);
      } else {
        destItems.splice(destination.index, 0, moved);
      }

      return {
        ...prev,
        columns: {
          ...prev.columns,
          [sourceCol.id]: { ...sourceCol, items: sourceItems },
          [destCol.id]: { ...destCol, items: destItems },
        },
      };
    });
  };

  // ======================
  // UPDATE TASK (SUPPORT PIC)
  // ======================
  const updateTask = (task: any) => {
    setBoard((prev: any) => {
      const newCols = { ...prev.columns };

      Object.keys(newCols).forEach((colId) => {
        newCols[colId].items = newCols[colId].items.map((t: any) =>
          t.id === task.id ? task : t
        );
      });

      return { ...prev, columns: newCols };
    });
  };

  return (
    <div className="mt-6 dnd-board">

      {/* INPUT */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Tambah task..."
          className="border p-2 rounded w-full text-black"
        />

        <button onClick={addTask} className="bg-blue-500 text-white px-4 py-2 rounded">
          Add
        </button>

        <button onClick={addColumn} className="bg-green-500 text-white px-4 py-2 rounded">
          + List
        </button>
      </div>

      {/* BOARD */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="board" direction="horizontal" type="column">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="flex gap-3 overflow-x-auto pb-4">
              {board.columnOrder.map((colId: string, index: number) => {
                const col = board.columns[colId];

                return (
                  <Draggable key={col.id} draggableId={col.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="bg-gray-100 dark:bg-gray-900 p-3 rounded-xl border w-[80vw] sm:w-[280px] shrink-0"
                      >
                        {/* HEADER */}
                        <div className="flex justify-between items-center mb-3">

                          {editingCol === col.id ? (
                            <input
                              value={tempTitle}
                              onChange={(e) => setTempTitle(e.target.value)}
                              onBlur={() => saveColumnTitle(col.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  saveColumnTitle(col.id);
                                }
                              }}
                              autoFocus
                              className="text-black w-full"
                            />
                          ) : (
                            <div
                              {...provided.dragHandleProps}
                              className="font-bold cursor-grab flex gap-2 items-center"
                            >
                              {col.title}
                              <button
                                onClick={() => {
                                  setEditingCol(col.id);
                                  setTempTitle(col.title);
                                }}
                                className="text-xs bg-gray-300 px-1 rounded"
                              >
                                ✎
                              </button>
                            </div>
                          )}

                          <button
                            onClick={() => {
                              if (confirm("Hapus list ini?")) {
                                deleteColumn(col.id);
                              }
                            }}
                            className="text-xs bg-red-500 text-white px-2 rounded"
                          >
                            ✕
                          </button>
                        </div>

                        <Droppable droppableId={col.id} type="task">
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: "80px" }}>
                              {col.items.map((task: any, i: number) => (
                                <Draggable key={task.id} draggableId={task.id} index={i}>
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className="p-3 mb-2 rounded-lg shadow"
                                      style={{
                                        background: task.color,
                                        color: "white",
                                        ...provided.draggableProps.style,
                                      }}
                                    >
                                      <div {...provided.dragHandleProps} className="text-xs mb-2 cursor-grab opacity-70">
                                        ⠿ drag
                                      </div>

                                      <div className="flex justify-between">
                                        <div onClick={() => setSelected(task)} className="cursor-pointer">
                                          <div>{task.content}</div>

                                        {/* 🔥 SHOW PIC + AVATAR */}
                                        {task.pic && (
                                          <div className="flex items-center gap-2 mt-2">
                                            
                                            {/* AVATAR */}
                                            {users.find(u => u.id == task.pic)?.avatar ? (
                                              <img
                                                src={users.find(u => u.id == task.pic)?.avatar}
                                                className="w-6 h-6 rounded-full object-cover border"
                                              />
                                            ) : (
                                              <div className="w-6 h-6 rounded-full bg-black/30 flex items-center justify-center text-[10px]">
                                                ?
                                              </div>
                                            )}

                                            {/* USERNAME */}
                                            <div className="text-xs">
                                              {users.find(u => u.id == task.pic)?.username}
                                            </div>

                                          </div>
                                        )}
                                        </div>

                                        <button
                                          onClick={() => deleteTask(task.id)}
                                          className="text-xs bg-black/30 px-2 rounded"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>

                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center" onClick={() => setSelected(null)}>
          <div className="bg-white p-5 rounded w-full max-w-md text-black" onClick={(e) => e.stopPropagation()}>
            <input
              className="border p-2 w-full mb-3"
              value={selected.content}
              onChange={(e) => setSelected({ ...selected, content: e.target.value })}
            />

            <textarea
              className="border p-2 w-full mb-3"
              value={selected.notes}
              onChange={(e) => setSelected({ ...selected, notes: e.target.value })}
            />

            <input
              type="date"
              className="border p-2 w-full mb-3"
              value={selected.dueDate}
              onChange={(e) => setSelected({ ...selected, dueDate: e.target.value })}
            />

            {/* 🔥 PIC SELECT */}
            <select
              value={selected.pic || ""}
              onChange={(e) => setSelected({ ...selected, pic: e.target.value })}
              className="border p-2 w-full mb-3"
            >
              <option value="">Pilih PIC</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username}
                  </option>
                ))}
            </select>
x
            <button
              onClick={() => {
                updateTask(selected);
                setSelected(null);
              }}
              className="bg-blue-500 text-white w-full py-2 rounded"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}