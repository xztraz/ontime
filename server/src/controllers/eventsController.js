// get database
import { db, data } from '../app.js';

// utils
import { generateId } from '../utils/generate_id.js';
import {
  event as eventDef,
  delay as delayDef,
  block as blockDef,
} from '../models/eventsDefinition.js';

async function _insertAt(entry, index) {
  // get events
  let events = data.events;
  let count = events.length;
  let order = entry.order;

  // Remove order field from object
  delete entry.order;

  // Insert at beginning
  if (order === 0) {
    events.unshift(entry);
  }

  // insert at end
  else if (order >= count) {
    events.push(entry);
  }

  // insert in the middle
  else {
    events.splice(index, 0, entry);
  }

  // save events
  data.events = events;
  await db.write();
}

async function _removeById(eventId) {
  data.events = Array.from(data.events).filter((e) => e.id !== eventId);
  await db.write();
}

function getEventEvents() {
  // return data.events.filter((e) => e.type === 'event');
  return Array.from(data.events).filter((e) => e.type === 'event');
}

// Updates timer object
function _updateTimers() {
  const results = getEventEvents();
  global.timer.updateEventList(results);
}

// Updates timer object single event
function _updateTimersSingle(id, entry) {
  global.timer.updateSingleEvent(id, entry);
}

// Delete a single entry in timer object
function _deleteTimerId(entryId) {
  global.timer.deleteId(entryId);
}

// Create controller for GET request to '/events'
// Returns -
export const eventsGetAll = async (req, res) => {
  res.json(data.events);
};

// Create controller for GET request to '/events/:eventId'
// Returns -
export const eventsGetById = async (req, res) => {
  const e = data.events.find({ id: req.params.eventId }).value();
  console.log('event by id', e);
  res.json(e);
};

// Create controller for POST request to '/events/'
// Returns -
export const eventsPost = async (req, res) => {
  // TODO: Validate event
  if (!req.body) {
    res.status(400).send(`No object found in request`);
    return;
  }

  // ensure structure
  let newEvent = {};
  req.body.id = generateId();

  switch (req.body.type) {
    case 'event':
      newEvent = { ...eventDef, ...req.body };
      break;
    case 'delay':
      newEvent = { ...delayDef, ...req.body };
      break;
    case 'block':
      newEvent = { ...blockDef, ...req.body };
      break;

    default:
      res
        .status(400)
        .send(`Object type missing or unrecognised: ${req.body.type}`);
      break;
  }

  try {
    // get place where event should be
    const index = newEvent.order || 0;

    // add new event in place
    await _insertAt(newEvent, index);

    // update timers
    _updateTimers();

    // reply OK
    res.sendStatus(201);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

// Create controller for PUT request to '/events/'
// Returns -
export const eventsPut = async (req, res) => {
  // no valid params
  if (!req.body) {
    res.status(400).send(`No object found`);
    return;
  }

  let eventId = req.body.id;
  if (!eventId) {
    res.status(400).send(`Object malformed: id missing`);
    return;
  }

  try {
    const eventIndex = data.events.findIndex((e) => e.id === eventId);
    if (eventIndex === -1) {
      res.status(400).send(`No Id found found`);
      return;
    }

    const e = data.events[eventIndex];
    data.events[eventIndex] = { ...e, ...req.body };
    data.events[eventIndex].revision++;
    await db.write();

    // update timer
    _updateTimersSingle(eventId, req.body);

    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

// Create controller for PATCH request to '/events/'
// Returns -
export const eventsPatch = async (req, res) => {
  // Code is the same as put, call that
  await eventsPut(req, res);
};

export const eventsReorder = async (req, res) => {
  // TODO: Validate event
  if (!req.body) {
    res.status(400).send(`No object found in request`);
    return;
  }

  const { index, from, to } = req.body;

  // get events
  let events = data.events;
  let idx = events.findIndex((e) => e.id === index, from);

  // Check if item is at given index
  if (idx !== from) {
    res.status(400).send(`Id not found at index`);
    return;
  }

  try {
    // remove item at from
    const [reorderedItem] = events.splice(from, 1);

    // reinsert item at to
    events.splice(to, 0, reorderedItem);

    // save events
    data.events = events;
    await db.write();

    // TODO: would it be more efficient to reorder at timer?
    // update timer
    _updateTimers();

    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

// Create controller for PATCH request to '/events/applydelay/:eventId'
// Returns -
export const eventsApplyDelay = async (req, res) => {
  // no valid params
  if (!req.params.eventId) {
    res.status(400).send(`No id found in request`);
    return;
  }

  try {
    // get events
    let events = data.events;

    // AUX
    let delayIndex = null;
    let blockIndex = null;
    let delayValue = 0;

    for (const [index, e] of events.entries()) {
      if (delayIndex == null) {
        // look for delay
        if (e.id === req.params.eventId && e.type === 'delay') {
          delayValue = e.duration;
          delayIndex = index;
        }
      }

      // apply delay value to all items until block or end
      else {
        if (e.type === 'event') {
          // update times
          e.timeStart += delayValue;
          e.timeEnd += delayValue;

          // increment revision
          e.revision += 1;
        } else if (e.type === 'block') {
          // save id and stop
          blockIndex = index;
          break;
        }
      }
    }

    // delete delay
    events.splice(delayIndex, 1);

    // delete block
    // index would have moved down since we deleted delay
    if (blockIndex) events.splice(blockIndex - 1, 1);

    // update events
    data.events = events;
    await db.write();

    // update timer
    _updateTimers();

    res.sendStatus(201);
  } catch (error) {
    console.log('debug:', error);

    res.status(400).send(error);
  }
};

// Create controller for DELETE request to '/events/:eventId'
// Returns -
export const eventsDelete = async (req, res) => {
  // no valid params
  if (!req.params.eventId) {
    res.status(400).send(`No id found in request`);
    return;
  }

  try {
    // remove new event
    await _removeById(req.params.eventId);

    // update timer
    _deleteTimerId(req.params.eventId);

    res.sendStatus(201);
  } catch (error) {
    console.log('debug:', error);

    res.status(400).send(error);
  }
};

// Create controller for DELETE request to '/events/:eventId'
// Returns -
export const eventsDeleteAll = async (req, res) => {
  try {
    // set with nothing
    data.events = [];
    await db.write();

    // update timer object
    global.timer.clearEventList();

    res.sendStatus(201);
  } catch (error) {
    res.status(400).send(error);
  }
};
