import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Users, Calendar as CalendarIcon } from "lucide-react";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

import { EventsAPI } from "../../api/events";

export default function EventManagement() {
  const [events, setEvents] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    branch: "Main Branch",
    capacity: 20,
    description: "",
  });

  // Load events from API
  useEffect(() => {
    EventsAPI.getAll().then(setEvents);
  }, []);

  const event = selectedEvent
    ? events.find((e) => e.id === selectedEvent)
    : null;

  const handleAddEvent = async () => {
    try {
      await EventsAPI.create(newEvent);
      const updated = await EventsAPI.getAll();
      setEvents(updated);
    } catch (err) {
      console.error("Failed to create event:", err);
    }

    setIsAddDialogOpen(false);
    setNewEvent({
      title: "",
      date: "",
      time: "",
      branch: "Main Branch",
      capacity: 20,
      description: "",
    });
  };

  const handleCancelEvent = async (eventId: string) => {
    try {
      await EventsAPI.cancel(eventId);
      const updated = await EventsAPI.getAll();
      setEvents(updated);
    } catch (err) {
      console.error("Failed to cancel event:", err);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Event Management</h1>
          <p className="text-neutral-600">
            Create and manage library events and programs
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} size="lg">
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-neutral-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-neutral-900">
                      Event
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-neutral-900">
                      Date & Time
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-neutral-900">
                      Branch
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-neutral-900">
                      Registration
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-neutral-900">
                      Status
                    </th>
                    <th className="text-right px-6 py-3 text-sm font-semibold text-neutral-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {events.map((evt) => (
                    <tr
                      key={evt.id}
                      className={`hover:bg-neutral-50 cursor-pointer ${
                        selectedEvent === evt.id ? "bg-blue-50" : ""
                      }`}
                      onClick={() => setSelectedEvent(evt.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium">{evt.title}</div>
                      </td>

                      <td className="px-6 py-4 text-sm text-neutral-600">
                        <div>{new Date(evt.date).toLocaleDateString()}</div>
                        <div className="text-xs text-neutral-500">{evt.time}</div>
                      </td>

                      <td className="px-6 py-4 text-sm text-neutral-600">
                        {evt.branch}
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <span className="font-medium">{evt.registered}</span>
                          <span className="text-neutral-500">
                            {" "}
                            / {evt.capacity}
                          </span>
                        </div>
                        <div className="w-full bg-neutral-200 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{
                              width: `${(evt.registered / evt.capacity) * 100}%`,
                            }}
                          />
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            evt.status === "Upcoming"
                              ? "bg-blue-100 text-blue-700"
                              : evt.status === "In Progress"
                              ? "bg-green-100 text-green-700"
                              : evt.status === "Completed"
                              ? "bg-neutral-100 text-neutral-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {evt.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div
                          className="flex items-center justify-end gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelEvent(evt.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="lg:col-span-1">
          {!event ? (
            <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center">
              <CalendarIcon className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500">Select an event to view details</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-neutral-200 p-6">
                <h3 className="text-lg font-semibold mb-4">{event.title}</h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CalendarIcon className="w-4 h-4 text-neutral-400" />
                      <span className="text-sm font-medium text-neutral-600">
                        Date & Time
                      </span>
                    </div>
                    <p>
                      {new Date(event.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-neutral-600">{event.time}</p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-neutral-600 block mb-1">
                      Branch
                    </span>
                    <p>{event.branch}</p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-neutral-600 block mb-1">
                      Description
                    </span>
                    <p className="text-sm text-neutral-700">
                      {event.description}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-neutral-400" />
                      <span className="text-sm font-medium text-neutral-600">
                        Registration
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-semibold">
                        {event.registered}
                      </span>
                      <span className="text-neutral-500">
                        / {event.capacity} spots
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(event.registered / event.capacity) * 100}%`,
                        }}
                      />
                    </div>
                    {event.registered >= event.capacity && (
                      <p className="text-sm text-red-600 mt-2">
                        Event is at capacity
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Event Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Event</DialogTitle>
            <DialogDescription>
              Fill out the details below to create a new library event.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={newEvent.date}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, date: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Time</Label>
              <Input
                type="time"
                value={newEvent.time}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, time: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Branch</Label>
              <Select
                value={newEvent.branch}
                onValueChange={(value) =>
                  setNewEvent({ ...newEvent, branch: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Main Branch">Main Branch</SelectItem>
                  <SelectItem value="East Branch">East Branch</SelectItem>
                  <SelectItem value="West Branch">West Branch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Capacity</Label>
              <Input
                type="number"
                value={newEvent.capacity}
                onChange={(e) =>
                  setNewEvent({
                    ...newEvent,
                    capacity: Number(e.target.value),
                  })
                }
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={newEvent.description}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, description: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleAddEvent}>Create Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
